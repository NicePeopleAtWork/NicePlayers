var JSON;
if (!JSON) {
    JSON = {}
}(function() {
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
            "\t": "\\t",
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
            } else {
                if (typeof space === "string") {
                    indent = space
                }
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
}());
/**
 * Version: 1.0 Alpha-1
 * Build Date: 13-Nov-2007
 * Copyright (c) 2006-2007, Coolite Inc. (http://www.coolite.com/). All rights reserved.
 * License: Licensed under The MIT License. See license.txt and http://www.datejs.com/license/.
 * Website: http://www.datejs.com/ or http://www.coolite.com/datejs/
 */
Date.CultureInfo = {
    name: "en-US",
    englishName: "English (United States)",
    nativeName: "English (United States)",
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    abbreviatedDayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    shortestDayNames: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    firstLetterDayNames: ["S", "M", "T", "W", "T", "F", "S"],
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    abbreviatedMonthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    amDesignator: "AM",
    pmDesignator: "PM",
    firstDayOfWeek: 0,
    twoDigitYearMax: 2029,
    dateElementOrder: "mdy",
    formatPatterns: {
        shortDate: "M/d/yyyy",
        longDate: "dddd, MMMM dd, yyyy",
        shortTime: "h:mm tt",
        longTime: "h:mm:ss tt",
        fullDateTime: "dddd, MMMM dd, yyyy h:mm:ss tt",
        sortableDateTime: "yyyy-MM-ddTHH:mm:ss",
        universalSortableDateTime: "yyyy-MM-dd HH:mm:ssZ",
        rfc1123: "ddd, dd MMM yyyy HH:mm:ss GMT",
        monthDay: "MMMM dd",
        yearMonth: "MMMM, yyyy"
    },
    regexPatterns: {
        jan: /^jan(uary)?/i,
        feb: /^feb(ruary)?/i,
        mar: /^mar(ch)?/i,
        apr: /^apr(il)?/i,
        may: /^may/i,
        jun: /^jun(e)?/i,
        jul: /^jul(y)?/i,
        aug: /^aug(ust)?/i,
        sep: /^sep(t(ember)?)?/i,
        oct: /^oct(ober)?/i,
        nov: /^nov(ember)?/i,
        dec: /^dec(ember)?/i,
        sun: /^su(n(day)?)?/i,
        mon: /^mo(n(day)?)?/i,
        tue: /^tu(e(s(day)?)?)?/i,
        wed: /^we(d(nesday)?)?/i,
        thu: /^th(u(r(s(day)?)?)?)?/i,
        fri: /^fr(i(day)?)?/i,
        sat: /^sa(t(urday)?)?/i,
        future: /^next/i,
        past: /^last|past|prev(ious)?/i,
        add: /^(\+|after|from)/i,
        subtract: /^(\-|before|ago)/i,
        yesterday: /^yesterday/i,
        today: /^t(oday)?/i,
        tomorrow: /^tomorrow/i,
        now: /^n(ow)?/i,
        millisecond: /^ms|milli(second)?s?/i,
        second: /^sec(ond)?s?/i,
        minute: /^min(ute)?s?/i,
        hour: /^h(ou)?rs?/i,
        week: /^w(ee)?k/i,
        month: /^m(o(nth)?s?)?/i,
        day: /^d(ays?)?/i,
        year: /^y((ea)?rs?)?/i,
        shortMeridian: /^(a|p)/i,
        longMeridian: /^(a\.?m?\.?|p\.?m?\.?)/i,
        timezone: /^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,
        ordinalSuffix: /^\s*(st|nd|rd|th)/i,
        timeContext: /^\s*(\:|a|p)/i
    },
    abbreviatedTimeZoneStandard: {
        GMT: "-000",
        EST: "-0400",
        CST: "-0500",
        MST: "-0600",
        PST: "-0700"
    },
    abbreviatedTimeZoneDST: {
        GMT: "-000",
        EDT: "-0500",
        CDT: "-0600",
        MDT: "-0700",
        PDT: "-0800"
    }
};
Date.getMonthNumberFromName = function(name) {
    var n = Date.CultureInfo.monthNames,
        m = Date.CultureInfo.abbreviatedMonthNames,
        s = name.toLowerCase();
    for (var i = 0; i < n.length; i++) {
        if (n[i].toLowerCase() == s || m[i].toLowerCase() == s) {
            return i;
        }
    }
    return -1;
};
Date.getDayNumberFromName = function(name) {
    var n = Date.CultureInfo.dayNames,
        m = Date.CultureInfo.abbreviatedDayNames,
        o = Date.CultureInfo.shortestDayNames,
        s = name.toLowerCase();
    for (var i = 0; i < n.length; i++) {
        if (n[i].toLowerCase() == s || m[i].toLowerCase() == s) {
            return i;
        }
    }
    return -1;
};
Date.isLeapYear = function(year) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
};
Date.getDaysInMonth = function(year, month) {
    return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};
Date.getTimezoneOffset = function(s, dst) {
    return (dst || false) ? Date.CultureInfo.abbreviatedTimeZoneDST[s.toUpperCase()] : Date.CultureInfo.abbreviatedTimeZoneStandard[s.toUpperCase()];
};
Date.getTimezoneAbbreviation = function(offset, dst) {
    var n = (dst || false) ? Date.CultureInfo.abbreviatedTimeZoneDST : Date.CultureInfo.abbreviatedTimeZoneStandard,
        p;
    for (p in n) {
        if (n[p] === offset) {
            return p;
        }
    }
    return null;
};
Date.prototype.clone = function() {
    return new Date(this.getTime());
};
Date.prototype.compareTo = function(date) {
    if (isNaN(this)) {
        throw new Error(this);
    }
    if (date instanceof Date && !isNaN(date)) {
        return (this > date) ? 1 : (this < date) ? -1 : 0;
    } else {
        throw new TypeError(date);
    }
};
Date.prototype.equals = function(date) {
    return (this.compareTo(date) === 0);
};
Date.prototype.between = function(start, end) {
    var t = this.getTime();
    return t >= start.getTime() && t <= end.getTime();
};
Date.prototype.addMilliseconds = function(value) {
    this.setMilliseconds(this.getMilliseconds() + value);
    return this;
};
Date.prototype.addSeconds = function(value) {
    return this.addMilliseconds(value * 1000);
};
Date.prototype.addMinutes = function(value) {
    return this.addMilliseconds(value * 60000);
};
Date.prototype.addHours = function(value) {
    return this.addMilliseconds(value * 3600000);
};
Date.prototype.addDays = function(value) {
    return this.addMilliseconds(value * 86400000);
};
Date.prototype.addWeeks = function(value) {
    return this.addMilliseconds(value * 604800000);
};
Date.prototype.addMonths = function(value) {
    var n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + value);
    this.setDate(Math.min(n, this.getDaysInMonth()));
    return this;
};
Date.prototype.addYears = function(value) {
    return this.addMonths(value * 12);
};
Date.prototype.add = function(config) {
    if (typeof config == "number") {
        this._orient = config;
        return this;
    }
    var x = config;
    if (x.millisecond || x.milliseconds) {
        this.addMilliseconds(x.millisecond || x.milliseconds);
    }
    if (x.second || x.seconds) {
        this.addSeconds(x.second || x.seconds);
    }
    if (x.minute || x.minutes) {
        this.addMinutes(x.minute || x.minutes);
    }
    if (x.hour || x.hours) {
        this.addHours(x.hour || x.hours);
    }
    if (x.month || x.months) {
        this.addMonths(x.month || x.months);
    }
    if (x.year || x.years) {
        this.addYears(x.year || x.years);
    }
    if (x.day || x.days) {
        this.addDays(x.day || x.days);
    }
    return this;
};
Date._validate = function(value, min, max, name) {
    if (typeof value != "number") {
        throw new TypeError(value + " is not a Number.");
    } else if (value < min || value > max) {
        throw new RangeError(value + " is not a valid value for " + name + ".");
    }
    return true;
};
Date.validateMillisecond = function(n) {
    return Date._validate(n, 0, 999, "milliseconds");
};
Date.validateSecond = function(n) {
    return Date._validate(n, 0, 59, "seconds");
};
Date.validateMinute = function(n) {
    return Date._validate(n, 0, 59, "minutes");
};
Date.validateHour = function(n) {
    return Date._validate(n, 0, 23, "hours");
};
Date.validateDay = function(n, year, month) {
    return Date._validate(n, 1, Date.getDaysInMonth(year, month), "days");
};
Date.validateMonth = function(n) {
    return Date._validate(n, 0, 11, "months");
};
Date.validateYear = function(n) {
    return Date._validate(n, 1, 9999, "seconds");
};
Date.prototype.set = function(config) {
    var x = config;
    if (!x.millisecond && x.millisecond !== 0) {
        x.millisecond = -1;
    }
    if (!x.second && x.second !== 0) {
        x.second = -1;
    }
    if (!x.minute && x.minute !== 0) {
        x.minute = -1;
    }
    if (!x.hour && x.hour !== 0) {
        x.hour = -1;
    }
    if (!x.day && x.day !== 0) {
        x.day = -1;
    }
    if (!x.month && x.month !== 0) {
        x.month = -1;
    }
    if (!x.year && x.year !== 0) {
        x.year = -1;
    }
    if (x.millisecond != -1 && Date.validateMillisecond(x.millisecond)) {
        this.addMilliseconds(x.millisecond - this.getMilliseconds());
    }
    if (x.second != -1 && Date.validateSecond(x.second)) {
        this.addSeconds(x.second - this.getSeconds());
    }
    if (x.minute != -1 && Date.validateMinute(x.minute)) {
        this.addMinutes(x.minute - this.getMinutes());
    }
    if (x.hour != -1 && Date.validateHour(x.hour)) {
        this.addHours(x.hour - this.getHours());
    }
    if (x.month !== -1 && Date.validateMonth(x.month)) {
        this.addMonths(x.month - this.getMonth());
    }
    if (x.year != -1 && Date.validateYear(x.year)) {
        this.addYears(x.year - this.getFullYear());
    }
    if (x.day != -1 && Date.validateDay(x.day, this.getFullYear(), this.getMonth())) {
        this.addDays(x.day - this.getDate());
    }
    if (x.timezone) {
        this.setTimezone(x.timezone);
    }
    if (x.timezoneOffset) {
        this.setTimezoneOffset(x.timezoneOffset);
    }
    return this;
};
Date.prototype.clearTime = function() {
    this.setHours(0);
    this.setMinutes(0);
    this.setSeconds(0);
    this.setMilliseconds(0);
    return this;
};
Date.prototype.isLeapYear = function() {
    var y = this.getFullYear();
    return (((y % 4 === 0) && (y % 100 !== 0)) || (y % 400 === 0));
};
Date.prototype.isWeekday = function() {
    return !(this.is().sat() || this.is().sun());
};
Date.prototype.getDaysInMonth = function() {
    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};
Date.prototype.moveToFirstDayOfMonth = function() {
    return this.set({
        day: 1
    });
};
Date.prototype.moveToLastDayOfMonth = function() {
    return this.set({
        day: this.getDaysInMonth()
    });
};
Date.prototype.moveToDayOfWeek = function(day, orient) {
    var diff = (day - this.getDay() + 7 * (orient || +1)) % 7;
    return this.addDays((diff === 0) ? diff += 7 * (orient || +1) : diff);
};
Date.prototype.moveToMonth = function(month, orient) {
    var diff = (month - this.getMonth() + 12 * (orient || +1)) % 12;
    return this.addMonths((diff === 0) ? diff += 12 * (orient || +1) : diff);
};
Date.prototype.getDayOfYear = function() {
    return Math.floor((this - new Date(this.getFullYear(), 0, 1)) / 86400000);
};
Date.prototype.getWeekOfYear = function(firstDayOfWeek) {
    var y = this.getFullYear(),
        m = this.getMonth(),
        d = this.getDate();
    var dow = firstDayOfWeek || Date.CultureInfo.firstDayOfWeek;
    var offset = 7 + 1 - new Date(y, 0, 1).getDay();
    if (offset == 8) {
        offset = 1;
    }
    var daynum = ((Date.UTC(y, m, d, 0, 0, 0) - Date.UTC(y, 0, 1, 0, 0, 0)) / 86400000) + 1;
    var w = Math.floor((daynum - offset + 7) / 7);
    if (w === dow) {
        y--;
        var prevOffset = 7 + 1 - new Date(y, 0, 1).getDay();
        if (prevOffset == 2 || prevOffset == 8) {
            w = 53;
        } else {
            w = 52;
        }
    }
    return w;
};
Date.prototype.isDST = function() {
    return this.toString().match(/(E|C|M|P)(S|D)T/)[2] == "D";
};
Date.prototype.getTimezone = function() {
    return Date.getTimezoneAbbreviation(this.getUTCOffset, this.isDST());
};
Date.prototype.setTimezoneOffset = function(s) {
    var here = this.getTimezoneOffset(),
        there = Number(s) * -6 / 10;
    this.addMinutes(there - here);
    return this;
};
Date.prototype.setTimezone = function(s) {
    return this.setTimezoneOffset(Date.getTimezoneOffset(s));
};
Date.prototype.getUTCOffset = function() {
    var n = this.getTimezoneOffset() * -10 / 6,
        r;
    if (n < 0) {
        r = (n - 10000).toString();
        return r[0] + r.substr(2);
    } else {
        r = (n + 10000).toString();
        return "+" + r.substr(1);
    }
};
Date.prototype.getDayName = function(abbrev) {
    return abbrev ? Date.CultureInfo.abbreviatedDayNames[this.getDay()] : Date.CultureInfo.dayNames[this.getDay()];
};
Date.prototype.getMonthName = function(abbrev) {
    return abbrev ? Date.CultureInfo.abbreviatedMonthNames[this.getMonth()] : Date.CultureInfo.monthNames[this.getMonth()];
};
Date.prototype._toString = Date.prototype.toString;
Date.prototype.toString = function(format) {
    var self = this;
    var p = function p(s) {
        return (s.toString().length == 1) ? "0" + s : s;
    };
    return format ? format.replace(/dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|zz?z?/g, function(format) {
        switch (format) {
            case "hh":
                return p(self.getHours() < 13 ? self.getHours() : (self.getHours() - 12));
            case "h":
                return self.getHours() < 13 ? self.getHours() : (self.getHours() - 12);
            case "HH":
                return p(self.getHours());
            case "H":
                return self.getHours();
            case "mm":
                return p(self.getMinutes());
            case "m":
                return self.getMinutes();
            case "ss":
                return p(self.getSeconds());
            case "s":
                return self.getSeconds();
            case "yyyy":
                return self.getFullYear();
            case "yy":
                return self.getFullYear().toString().substring(2, 4);
            case "dddd":
                return self.getDayName();
            case "ddd":
                return self.getDayName(true);
            case "dd":
                return p(self.getDate());
            case "d":
                return self.getDate().toString();
            case "MMMM":
                return self.getMonthName();
            case "MMM":
                return self.getMonthName(true);
            case "MM":
                return p((self.getMonth() + 1));
            case "M":
                return self.getMonth() + 1;
            case "t":
                return self.getHours() < 12 ? Date.CultureInfo.amDesignator.substring(0, 1) : Date.CultureInfo.pmDesignator.substring(0, 1);
            case "tt":
                return self.getHours() < 12 ? Date.CultureInfo.amDesignator : Date.CultureInfo.pmDesignator;
            case "zzz":
            case "zz":
            case "z":
                return "";
        }
    }) : this._toString();
};
Date.now = function() {
    return new Date();
};
Date.today = function() {
    return Date.now().clearTime();
};
Date.prototype._orient = +1;
Date.prototype.next = function() {
    this._orient = +1;
    return this;
};
Date.prototype.last = Date.prototype.prev = Date.prototype.previous = function() {
    this._orient = -1;
    return this;
};
Date.prototype._is = false;
Date.prototype.is = function() {
    this._is = true;
    return this;
};
Number.prototype._dateElement = "day";
Number.prototype.fromNow = function() {
    var c = {};
    c[this._dateElement] = this;
    return Date.now().add(c);
};
Number.prototype.ago = function() {
    var c = {};
    c[this._dateElement] = this * -1;
    return Date.now().add(c);
};
(function() {
    var $D = Date.prototype,
        $N = Number.prototype;
    var dx = ("sunday monday tuesday wednesday thursday friday saturday").split(/\s/),
        mx = ("january february march april may june july august september october november december").split(/\s/),
        px = ("Millisecond Second Minute Hour Day Week Month Year").split(/\s/),
        de;
    var df = function(n) {
        return function() {
            if (this._is) {
                this._is = false;
                return this.getDay() == n;
            }
            return this.moveToDayOfWeek(n, this._orient);
        };
    };
    for (var i = 0; i < dx.length; i++) {
        $D[dx[i]] = $D[dx[i].substring(0, 3)] = df(i);
    }
    var mf = function(n) {
        return function() {
            if (this._is) {
                this._is = false;
                return this.getMonth() === n;
            }
            return this.moveToMonth(n, this._orient);
        };
    };
    for (var j = 0; j < mx.length; j++) {
        $D[mx[j]] = $D[mx[j].substring(0, 3)] = mf(j);
    }
    var ef = function(j) {
        return function() {
            if (j.substring(j.length - 1) != "s") {
                j += "s";
            }
            return this["add" + j](this._orient);
        };
    };
    var nf = function(n) {
        return function() {
            this._dateElement = n;
            return this;
        };
    };
    for (var k = 0; k < px.length; k++) {
        de = px[k].toLowerCase();
        $D[de] = $D[de + "s"] = ef(px[k]);
        $N[de] = $N[de + "s"] = nf(de);
    }
}());
Date.prototype.toJSONString = function() {
    return this.toString("yyyy-MM-ddThh:mm:ssZ");
};
Date.prototype.toShortDateString = function() {
    return this.toString(Date.CultureInfo.formatPatterns.shortDatePattern);
};
Date.prototype.toLongDateString = function() {
    return this.toString(Date.CultureInfo.formatPatterns.longDatePattern);
};
Date.prototype.toShortTimeString = function() {
    return this.toString(Date.CultureInfo.formatPatterns.shortTimePattern);
};
Date.prototype.toLongTimeString = function() {
    return this.toString(Date.CultureInfo.formatPatterns.longTimePattern);
};
Date.prototype.getOrdinal = function() {
    switch (this.getDate()) {
        case 1:
        case 21:
        case 31:
            return "st";
        case 2:
        case 22:
            return "nd";
        case 3:
        case 23:
            return "rd";
        default:
            return "th";
    }
};
(function() {
    Date.Parsing = {
        Exception: function(s) {
            this.message = "Parse error at '" + s.substring(0, 10) + " ...'";
        }
    };
    var $P = Date.Parsing;
    var _ = $P.Operators = {
        rtoken: function(r) {
            return function(s) {
                var mx = s.match(r);
                if (mx) {
                    return ([mx[0], s.substring(mx[0].length)]);
                } else {
                    throw new $P.Exception(s);
                }
            };
        },
        token: function(s) {
            return function(s) {
                return _.rtoken(new RegExp("^\s*" + s + "\s*"))(s);
            };
        },
        stoken: function(s) {
            return _.rtoken(new RegExp("^" + s));
        },
        until: function(p) {
            return function(s) {
                var qx = [],
                    rx = null;
                while (s.length) {
                    try {
                        rx = p.call(this, s);
                    } catch (e) {
                        qx.push(rx[0]);
                        s = rx[1];
                        continue;
                    }
                    break;
                }
                return [qx, s];
            };
        },
        many: function(p) {
            return function(s) {
                var rx = [],
                    r = null;
                while (s.length) {
                    try {
                        r = p.call(this, s);
                    } catch (e) {
                        return [rx, s];
                    }
                    rx.push(r[0]);
                    s = r[1];
                }
                return [rx, s];
            };
        },
        optional: function(p) {
            return function(s) {
                var r = null;
                try {
                    r = p.call(this, s);
                } catch (e) {
                    return [null, s];
                }
                return [r[0], r[1]];
            };
        },
        not: function(p) {
            return function(s) {
                try {
                    p.call(this, s);
                } catch (e) {
                    return [null, s];
                }
                throw new $P.Exception(s);
            };
        },
        ignore: function(p) {
            return p ? function(s) {
                var r = null;
                r = p.call(this, s);
                return [null, r[1]];
            } : null;
        },
        product: function() {
            var px = arguments[0],
                qx = Array.prototype.slice.call(arguments, 1),
                rx = [];
            for (var i = 0; i < px.length; i++) {
                rx.push(_.each(px[i], qx));
            }
            return rx;
        },
        cache: function(rule) {
            var cache = {},
                r = null;
            return function(s) {
                try {
                    r = cache[s] = (cache[s] || rule.call(this, s));
                } catch (e) {
                    r = cache[s] = e;
                }
                if (r instanceof $P.Exception) {
                    throw r;
                } else {
                    return r;
                }
            };
        },
        any: function() {
            var px = arguments;
            return function(s) {
                var r = null;
                for (var i = 0; i < px.length; i++) {
                    if (px[i] == null) {
                        continue;
                    }
                    try {
                        r = (px[i].call(this, s));
                    } catch (e) {
                        r = null;
                    }
                    if (r) {
                        return r;
                    }
                }
                throw new $P.Exception(s);
            };
        },
        each: function() {
            var px = arguments;
            return function(s) {
                var rx = [],
                    r = null;
                for (var i = 0; i < px.length; i++) {
                    if (px[i] == null) {
                        continue;
                    }
                    try {
                        r = (px[i].call(this, s));
                    } catch (e) {
                        throw new $P.Exception(s);
                    }
                    rx.push(r[0]);
                    s = r[1];
                }
                return [rx, s];
            };
        },
        all: function() {
            var px = arguments,
                _ = _;
            return _.each(_.optional(px));
        },
        sequence: function(px, d, c) {
            d = d || _.rtoken(/^\s*/);
            c = c || null;
            if (px.length == 1) {
                return px[0];
            }
            return function(s) {
                var r = null,
                    q = null;
                var rx = [];
                for (var i = 0; i < px.length; i++) {
                    try {
                        r = px[i].call(this, s);
                    } catch (e) {
                        break;
                    }
                    rx.push(r[0]);
                    try {
                        q = d.call(this, r[1]);
                    } catch (ex) {
                        q = null;
                        break;
                    }
                    s = q[1];
                }
                if (!r) {
                    throw new $P.Exception(s);
                }
                if (q) {
                    throw new $P.Exception(q[1]);
                }
                if (c) {
                    try {
                        r = c.call(this, r[1]);
                    } catch (ey) {
                        throw new $P.Exception(r[1]);
                    }
                }
                return [rx, (r ? r[1] : s)];
            };
        },
        between: function(d1, p, d2) {
            d2 = d2 || d1;
            var _fn = _.each(_.ignore(d1), p, _.ignore(d2));
            return function(s) {
                var rx = _fn.call(this, s);
                return [
                    [rx[0][0], r[0][2]], rx[1]
                ];
            };
        },
        list: function(p, d, c) {
            d = d || _.rtoken(/^\s*/);
            c = c || null;
            return (p instanceof Array ? _.each(_.product(p.slice(0, -1), _.ignore(d)), p.slice(-1), _.ignore(c)) : _.each(_.many(_.each(p, _.ignore(d))), px, _.ignore(c)));
        },
        set: function(px, d, c) {
            d = d || _.rtoken(/^\s*/);
            c = c || null;
            return function(s) {
                var r = null,
                    p = null,
                    q = null,
                    rx = null,
                    best = [
                        [], s
                    ],
                    last = false;
                for (var i = 0; i < px.length; i++) {
                    q = null;
                    p = null;
                    r = null;
                    last = (px.length == 1);
                    try {
                        r = px[i].call(this, s);
                    } catch (e) {
                        continue;
                    }
                    rx = [
                        [r[0]], r[1]
                    ];
                    if (r[1].length > 0 && !last) {
                        try {
                            q = d.call(this, r[1]);
                        } catch (ex) {
                            last = true;
                        }
                    } else {
                        last = true;
                    }
                    if (!last && q[1].length === 0) {
                        last = true;
                    }
                    if (!last) {
                        var qx = [];
                        for (var j = 0; j < px.length; j++) {
                            if (i != j) {
                                qx.push(px[j]);
                            }
                        }
                        p = _.set(qx, d).call(this, q[1]);
                        if (p[0].length > 0) {
                            rx[0] = rx[0].concat(p[0]);
                            rx[1] = p[1];
                        }
                    }
                    if (rx[1].length < best[1].length) {
                        best = rx;
                    }
                    if (best[1].length === 0) {
                        break;
                    }
                }
                if (best[0].length === 0) {
                    return best;
                }
                if (c) {
                    try {
                        q = c.call(this, best[1]);
                    } catch (ey) {
                        throw new $P.Exception(best[1]);
                    }
                    best[1] = q[1];
                }
                return best;
            };
        },
        forward: function(gr, fname) {
            return function(s) {
                return gr[fname].call(this, s);
            };
        },
        replace: function(rule, repl) {
            return function(s) {
                var r = rule.call(this, s);
                return [repl, r[1]];
            };
        },
        process: function(rule, fn) {
            return function(s) {
                var r = rule.call(this, s);
                return [fn.call(this, r[0]), r[1]];
            };
        },
        min: function(min, rule) {
            return function(s) {
                var rx = rule.call(this, s);
                if (rx[0].length < min) {
                    throw new $P.Exception(s);
                }
                return rx;
            };
        }
    };
    var _generator = function(op) {
        return function() {
            var args = null,
                rx = [];
            if (arguments.length > 1) {
                args = Array.prototype.slice.call(arguments);
            } else if (arguments[0] instanceof Array) {
                args = arguments[0];
            }
            if (args) {
                for (var i = 0, px = args.shift(); i < px.length; i++) {
                    args.unshift(px[i]);
                    rx.push(op.apply(null, args));
                    args.shift();
                    return rx;
                }
            } else {
                return op.apply(null, arguments);
            }
        };
    };
    var gx = "optional not ignore cache".split(/\s/);
    for (var i = 0; i < gx.length; i++) {
        _[gx[i]] = _generator(_[gx[i]]);
    }
    var _vector = function(op) {
        return function() {
            if (arguments[0] instanceof Array) {
                return op.apply(null, arguments[0]);
            } else {
                return op.apply(null, arguments);
            }
        };
    };
    var vx = "each any all".split(/\s/);
    for (var j = 0; j < vx.length; j++) {
        _[vx[j]] = _vector(_[vx[j]]);
    }
}());
(function() {
    var flattenAndCompact = function(ax) {
        var rx = [];
        for (var i = 0; i < ax.length; i++) {
            if (ax[i] instanceof Array) {
                rx = rx.concat(flattenAndCompact(ax[i]));
            } else {
                if (ax[i]) {
                    rx.push(ax[i]);
                }
            }
        }
        return rx;
    };
    Date.Grammar = {};
    Date.Translator = {
        hour: function(s) {
            return function() {
                this.hour = Number(s);
            };
        },
        minute: function(s) {
            return function() {
                this.minute = Number(s);
            };
        },
        second: function(s) {
            return function() {
                this.second = Number(s);
            };
        },
        meridian: function(s) {
            return function() {
                this.meridian = s.slice(0, 1).toLowerCase();
            };
        },
        timezone: function(s) {
            return function() {
                var n = s.replace(/[^\d\+\-]/g, "");
                if (n.length) {
                    this.timezoneOffset = Number(n);
                } else {
                    this.timezone = s.toLowerCase();
                }
            };
        },
        day: function(x) {
            var s = x[0];
            return function() {
                this.day = Number(s.match(/\d+/)[0]);
            };
        },
        month: function(s) {
            return function() {
                this.month = ((s.length == 3) ? Date.getMonthNumberFromName(s) : (Number(s) - 1));
            };
        },
        year: function(s) {
            return function() {
                var n = Number(s);
                this.year = ((s.length > 2) ? n : (n + (((n + 2000) < Date.CultureInfo.twoDigitYearMax) ? 2000 : 1900)));
            };
        },
        rday: function(s) {
            return function() {
                switch (s) {
                    case "yesterday":
                        this.days = -1;
                        break;
                    case "tomorrow":
                        this.days = 1;
                        break;
                    case "today":
                        this.days = 0;
                        break;
                    case "now":
                        this.days = 0;
                        this.now = true;
                        break;
                }
            };
        },
        finishExact: function(x) {
            x = (x instanceof Array) ? x : [x];
            var now = new Date();
            this.year = now.getFullYear();
            this.month = now.getMonth();
            this.day = 1;
            this.hour = 0;
            this.minute = 0;
            this.second = 0;
            for (var i = 0; i < x.length; i++) {
                if (x[i]) {
                    x[i].call(this);
                }
            }
            this.hour = (this.meridian == "p" && this.hour < 13) ? this.hour + 12 : this.hour;
            if (this.day > Date.getDaysInMonth(this.year, this.month)) {
                throw new RangeError(this.day + " is not a valid value for days.");
            }
            var r = new Date(this.year, this.month, this.day, this.hour, this.minute, this.second);
            if (this.timezone) {
                r.set({
                    timezone: this.timezone
                });
            } else if (this.timezoneOffset) {
                r.set({
                    timezoneOffset: this.timezoneOffset
                });
            }
            return r;
        },
        finish: function(x) {
            x = (x instanceof Array) ? flattenAndCompact(x) : [x];
            if (x.length === 0) {
                return null;
            }
            for (var i = 0; i < x.length; i++) {
                if (typeof x[i] == "function") {
                    x[i].call(this);
                }
            }
            if (this.now) {
                return new Date();
            }
            var today = Date.today();
            var method = null;
            var expression = !!(this.days != null || this.orient || this.operator);
            if (expression) {
                var gap, mod, orient;
                orient = ((this.orient == "past" || this.operator == "subtract") ? -1 : 1);
                if (this.weekday) {
                    this.unit = "day";
                    gap = (Date.getDayNumberFromName(this.weekday) - today.getDay());
                    mod = 7;
                    this.days = gap ? ((gap + (orient * mod)) % mod) : (orient * mod);
                }
                if (this.month) {
                    this.unit = "month";
                    gap = (this.month - today.getMonth());
                    mod = 12;
                    this.months = gap ? ((gap + (orient * mod)) % mod) : (orient * mod);
                    this.month = null;
                }
                if (!this.unit) {
                    this.unit = "day";
                }
                if (this[this.unit + "s"] == null || this.operator != null) {
                    if (!this.value) {
                        this.value = 1;
                    }
                    if (this.unit == "week") {
                        this.unit = "day";
                        this.value = this.value * 7;
                    }
                    this[this.unit + "s"] = this.value * orient;
                }
                return today.add(this);
            } else {
                if (this.meridian && this.hour) {
                    this.hour = (this.hour < 13 && this.meridian == "p") ? this.hour + 12 : this.hour;
                }
                if (this.weekday && !this.day) {
                    this.day = (today.addDays((Date.getDayNumberFromName(this.weekday) - today.getDay()))).getDate();
                }
                if (this.month && !this.day) {
                    this.day = 1;
                }
                return today.set(this);
            }
        }
    };
    var _ = Date.Parsing.Operators,
        g = Date.Grammar,
        t = Date.Translator,
        _fn;
    g.datePartDelimiter = _.rtoken(/^([\s\-\.\,\/\x27]+)/);
    g.timePartDelimiter = _.stoken(":");
    g.whiteSpace = _.rtoken(/^\s*/);
    g.generalDelimiter = _.rtoken(/^(([\s\,]|at|on)+)/);
    var _C = {};
    g.ctoken = function(keys) {
        var fn = _C[keys];
        if (!fn) {
            var c = Date.CultureInfo.regexPatterns;
            var kx = keys.split(/\s+/),
                px = [];
            for (var i = 0; i < kx.length; i++) {
                px.push(_.replace(_.rtoken(c[kx[i]]), kx[i]));
            }
            fn = _C[keys] = _.any.apply(null, px);
        }
        return fn;
    };
    g.ctoken2 = function(key) {
        return _.rtoken(Date.CultureInfo.regexPatterns[key]);
    };
    g.h = _.cache(_.process(_.rtoken(/^(0[0-9]|1[0-2]|[1-9])/), t.hour));
    g.hh = _.cache(_.process(_.rtoken(/^(0[0-9]|1[0-2])/), t.hour));
    g.H = _.cache(_.process(_.rtoken(/^([0-1][0-9]|2[0-3]|[0-9])/), t.hour));
    g.HH = _.cache(_.process(_.rtoken(/^([0-1][0-9]|2[0-3])/), t.hour));
    g.m = _.cache(_.process(_.rtoken(/^([0-5][0-9]|[0-9])/), t.minute));
    g.mm = _.cache(_.process(_.rtoken(/^[0-5][0-9]/), t.minute));
    g.s = _.cache(_.process(_.rtoken(/^([0-5][0-9]|[0-9])/), t.second));
    g.ss = _.cache(_.process(_.rtoken(/^[0-5][0-9]/), t.second));
    g.hms = _.cache(_.sequence([g.H, g.mm, g.ss], g.timePartDelimiter));
    g.t = _.cache(_.process(g.ctoken2("shortMeridian"), t.meridian));
    g.tt = _.cache(_.process(g.ctoken2("longMeridian"), t.meridian));
    g.z = _.cache(_.process(_.rtoken(/^(\+|\-)?\s*\d\d\d\d?/), t.timezone));
    g.zz = _.cache(_.process(_.rtoken(/^(\+|\-)\s*\d\d\d\d/), t.timezone));
    g.zzz = _.cache(_.process(g.ctoken2("timezone"), t.timezone));
    g.timeSuffix = _.each(_.ignore(g.whiteSpace), _.set([g.tt, g.zzz]));
    g.time = _.each(_.optional(_.ignore(_.stoken("T"))), g.hms, g.timeSuffix);
    g.d = _.cache(_.process(_.each(_.rtoken(/^([0-2]\d|3[0-1]|\d)/), _.optional(g.ctoken2("ordinalSuffix"))), t.day));
    g.dd = _.cache(_.process(_.each(_.rtoken(/^([0-2]\d|3[0-1])/), _.optional(g.ctoken2("ordinalSuffix"))), t.day));
    g.ddd = g.dddd = _.cache(_.process(g.ctoken("sun mon tue wed thu fri sat"), function(s) {
        return function() {
            this.weekday = s;
        };
    }));
    g.M = _.cache(_.process(_.rtoken(/^(1[0-2]|0\d|\d)/), t.month));
    g.MM = _.cache(_.process(_.rtoken(/^(1[0-2]|0\d)/), t.month));
    g.MMM = g.MMMM = _.cache(_.process(g.ctoken("jan feb mar apr may jun jul aug sep oct nov dec"), t.month));
    g.y = _.cache(_.process(_.rtoken(/^(\d\d?)/), t.year));
    g.yy = _.cache(_.process(_.rtoken(/^(\d\d)/), t.year));
    g.yyy = _.cache(_.process(_.rtoken(/^(\d\d?\d?\d?)/), t.year));
    g.yyyy = _.cache(_.process(_.rtoken(/^(\d\d\d\d)/), t.year));
    _fn = function() {
        return _.each(_.any.apply(null, arguments), _.not(g.ctoken2("timeContext")));
    };
    g.day = _fn(g.d, g.dd);
    g.month = _fn(g.M, g.MMM);
    g.year = _fn(g.yyyy, g.yy);
    g.orientation = _.process(g.ctoken("past future"), function(s) {
        return function() {
            this.orient = s;
        };
    });
    g.operator = _.process(g.ctoken("add subtract"), function(s) {
        return function() {
            this.operator = s;
        };
    });
    g.rday = _.process(g.ctoken("yesterday tomorrow today now"), t.rday);
    g.unit = _.process(g.ctoken("minute hour day week month year"), function(s) {
        return function() {
            this.unit = s;
        };
    });
    g.value = _.process(_.rtoken(/^\d\d?(st|nd|rd|th)?/), function(s) {
        return function() {
            this.value = s.replace(/\D/g, "");
        };
    });
    g.expression = _.set([g.rday, g.operator, g.value, g.unit, g.orientation, g.ddd, g.MMM]);
    _fn = function() {
        return _.set(arguments, g.datePartDelimiter);
    };
    g.mdy = _fn(g.ddd, g.month, g.day, g.year);
    g.ymd = _fn(g.ddd, g.year, g.month, g.day);
    g.dmy = _fn(g.ddd, g.day, g.month, g.year);
    g.date = function(s) {
        return ((g[Date.CultureInfo.dateElementOrder] || g.mdy).call(this, s));
    };
    g.format = _.process(_.many(_.any(_.process(_.rtoken(/^(dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|zz?z?)/), function(fmt) {
        if (g[fmt]) {
            return g[fmt];
        } else {
            throw Date.Parsing.Exception(fmt);
        }
    }), _.process(_.rtoken(/^[^dMyhHmstz]+/), function(s) {
        return _.ignore(_.stoken(s));
    }))), function(rules) {
        return _.process(_.each.apply(null, rules), t.finishExact);
    });
    var _F = {};
    var _get = function(f) {
        return _F[f] = (_F[f] || g.format(f)[0]);
    };
    g.formats = function(fx) {
        if (fx instanceof Array) {
            var rx = [];
            for (var i = 0; i < fx.length; i++) {
                rx.push(_get(fx[i]));
            }
            return _.any.apply(null, rx);
        } else {
            return _get(fx);
        }
    };
    g._formats = g.formats(["yyyy-MM-ddTHH:mm:ss", "ddd, MMM dd, yyyy H:mm:ss tt", "ddd MMM d yyyy HH:mm:ss zzz", "d"]);
    g._start = _.process(_.set([g.date, g.time, g.expression], g.generalDelimiter, g.whiteSpace), t.finish);
    g.start = function(s) {
        try {
            var r = g._formats.call({}, s);
            if (r[1].length === 0) {
                return r;
            }
        } catch (e) {}
        return g._start.call({}, s);
    };
}());
Date._parse = Date.parse;
Date.parse = function(s) {
    var r = null;
    if (!s) {
        return null;
    }
    try {
        r = Date.Grammar.start.call({}, s);
    } catch (e) {
        return null;
    }
    return ((r[1].length === 0) ? r[0] : null);
};
Date.getParseFunction = function(fx) {
    var fn = Date.Grammar.formats(fx);
    return function(s) {
        var r = null;
        try {
            r = fn.call({}, s);
        } catch (e) {
            return null;
        }
        return ((r[1].length === 0) ? r[0] : null);
    };
};
Date.parseExact = function(s, fx) {
    return Date.getParseFunction(fx)(s);
};
var totalChannelStorage = null;
try {
    if (navigator.userAgent.toLowerCase().indexOf("sony") > 0) {
        totalChannelStorage = null
    } else {
        if (typeof localStorage.getItem != "undefined") {
            totalChannelStorage = localStorage
        }
    }
} catch (e) {}
if (totalChannelStorage === null) {
    try {
        totalChannelStorage = {
            initialized: false,
            keys: {}
        };
        totalChannelStorage.init = function() {
            if (this.initialized == true) {
                return
            }
            try {
                var d = document.cookie.split(";");
                for (var c = 0; c < d.length; c++) {
                    var b = d[c];
                    while (b[0] == " ") {
                        b = b.substring(1)
                    }
                    var a = this.getKey(b.substring(0, b.indexOf("=")));
                    this.keys[a] = decodeURIComponent(b.substring(b.indexOf("=") + 1))
                }
            } catch (f) {}
            this.initialized = true
        };
        totalChannelStorage.setItem = function(d, g, c) {
            var b = this.getKey(d);
            totalChannelStorage.init();
            this.keys[b] = g;
            try {
                var a = new Date();
                var f = 0;
                if (c === true) {
                    f = Utils.now() + (10 * 365 * 24 * 3600 * 1000)
                } else {
                    f = Utils.now() + (30 * 24 * 3600 * 1000)
                }
                a.setTime(f);
                document.cookie = b + "=" + encodeURIComponent(g) + "; expires=" + a.toGMTString() + "; path=/"
            } catch (h) {}
            return this.keys[b]
        };
        totalChannelStorage.getKey = function(a) {
            return encodeURIComponent(a.replace(/\./g, "_"))
        };
        totalChannelStorage.getItem = function(c) {
            totalChannelStorage.init();
            var b = null;
            try {
                var a = this.getKey(c);
                b = this.keys[a]
            } catch (d) {
                b = null
            }
            return b
        }
    } catch (e) {}
};
TVA.OTT = TVA.OTT || {};
TVA.OTT.VER = "1.7.0s";
TVA.OTT.BASEURL = "https://api.totalchannel.tv/001/";
TVA.OTT.JSONREQUEST = "json";
TVA.OTT.PLAYER_CAN_PLAY_FROM_POSITION = true;
TVA.OTT.VIDEOCONTROLSHACKDISABLED = true;
TVA.OTT.DLU = "";
TVA.OTT.DAU = "";
TVA.OTT.HIDE_CONTROLS_TO = 10000;
TVA.OTT.SLIDER_TO = 7000;
TVA.OTT.CUSTOMDATA = true;
TVA.OTT.ACODE = "totalchdev";
TVA.OTT.ACODE = "totalch";
TVA.OTT.NICEBALANCER = false;
TVA.OTT.NICETOKEN = "";
TVA.OTT.ORIGINCODE = "";
TVA.OTT.OTTBALANCER = false;
TVA.GUI = TVA.GUI || {};
TVA.GUI.FOCUS_FOOTER = false;
TVA.OTT.TEST_UHD = false;
TVA.OTT.PAIRING = false;
TVA.OTT.LIST_FOCUS_OVER_PLAY = false;
TVA.OTT.SHOW_THUMB_REC_ICON = true;
TVA.OTT.CLOSE_CHLIST = false;
TVA.OTT = TVA.OTT || {};
TVA.OTT.BBQ = 1;
TVA.OTT.SERVICE = "TotalChannel";
TVA.OTT = TVA.OTT || {};
TVA.OTT.DEVICETYPE = 4000;
TVA.OTT.DEVICETYPE_PS4 = 4001;
TVA.OTT.DEVICETYPE_BRAVIA = 4002;
TVA.OTT.JSONREQUEST = "jsonp";
TVA.OTT.DRM = ["playready"];
TVA.tvKey = {};
TVA.tvKey.KEY_0 = 48;
TVA.tvKey.KEY_1 = 49;
TVA.tvKey.KEY_2 = 50;
TVA.tvKey.KEY_3 = 51;
TVA.tvKey.KEY_4 = 52;
TVA.tvKey.KEY_5 = 53;
TVA.tvKey.KEY_6 = 54;
TVA.tvKey.KEY_7 = 55;
TVA.tvKey.KEY_8 = 56;
TVA.tvKey.KEY_9 = 57;
TVA.tvKey.KEY_LEFT = 37;
TVA.tvKey.KEY_UP = 38;
TVA.tvKey.KEY_RIGHT = 39;
TVA.tvKey.KEY_DOWN = 40;
TVA.tvKey.KEY_RETURN = 8;
TVA.tvKey.KEY_ENTER = 13;
TVA.tvKey.KEY_INFO = 457;
TVA.tvKey.KEY_PLAY = 415;
TVA.tvKey.KEY_PAUSE = 19;
TVA.tvKey.KEY_RW = 412;
TVA.tvKey.KEY_FF = 417;
TVA.tvKey.KEY_STOP = 413;
TVA.tvKey.KEY_UP = 38;
TVA.tvKey.KEY_RED = 403;
TVA.tvKey.KEY_GREEN = 404;
TVA.tvKey.KEY_YELLOW = 405;
TVA.tvKey.KEY_BLUE = 406;
TVA.tvKey.KEY_CH_UP = 33;
TVA.tvKey.KEY_CH_DOWN = 34;
TVA.tvKey.KEY_FAST_FW = 126;
TVA.tvKey.KEY_FAST_RW = 127;
TVA.tvKey.FN_12 = 115;
TVA.tvKey.KEY_ZOOM = -4;
TVA.ScreenSaverTimeout = 600;
TVA.OTT = TVA.OTT || {};
TVA.OTT.STRINGS = {
    FAST_DEVICE_ENABLED: "Modo hardware rápido ( hardware blitting )",
    SLOW_DEVICE_ENABLED: "Modo hardware lento ( no hardware blitting )"
};
var Main = {
    username: "",
    unloaded: false,
    deviceId: null,
    timeOffset: 120,
    falseKeypressCounter: 0,
    isInBackground: false,
    init: function() {
        Main.username = "";
        Main.unloaded = false;
        Main.falseKeypressCounter = 0;
        MouseWheel.init()
    },
    debugMustBeEnabled: function() {
        return false;
        try {
            if (document && document.location && document.location.href && (document.location.href.indexOf("debug=true") > 0 || document.location.href.indexOf("debug.true") > 0)) {
                return true
            }
        } catch (a) {}
        return false
    },
    onLoad: function() {
        var b = false;
        try {
            API.initializing = Utils.now();
            if (Main.debugMustBeEnabled() == true) {
                b = true
            }
        } catch (f) {}
        Debug.init(b);
        if (TVA.device !== "ps3") {
            API.init()
        }
        Main.init();
        View.init();
        Header.init();
        OTTAnalytics.init();
        var d = $("body");
        if (navigator.userAgent.toLowerCase().indexOf("sony") > 0) {
            d.removeClass("ps3body")
        }
        TVA.init();
        Main.switchDRM(-1);
        TVA_Player.init();
        Utils.initZoom();
        d.addClass("bbq" + TVA.OTT.BBQ);
        if (TVA.device === "lg") {
            d.addClass("lg")
        } else {
            if (TVA.device === "samsung") {
                d.addClass("samsung");
                if (TVA.year < 2012) {
                    d.addClass("samsung2011")
                }
            } else {
                if (TVA.device === "ps3") {
                    if (navigator.userAgent.toLowerCase().indexOf("sony") > 0) {
                        window.platform.ver = 0;
                        TVA.OTT.DEVICETYPE = TVA.OTT.DEVICETYPE_BRAVIA;
                        d.addClass("sony");
                        TVA.zoomMargins = null
                    } else {
                        d.addClass("ps3")
                    }
                    if (navigator.userAgent.toLowerCase().indexOf("playstation 4") > 0) {
                        TVA.OTT.DEVICETYPE = TVA.OTT.DEVICETYPE_PS4;
                        TVA.year = 2013;
                        window.platform.ver = 4;
                        TVA.zoomMargins.step = 0.01
                    }
                }
            }
        }
        Utils.setBlitting();
        var g = $("#platform-id");
        var a = "";
        switch (TVA.OTT.DEVICETYPE) {
            case 3000:
                g.html(a + "Samsung");
                break;
            case 3001:
                g.html(a + "LG");
                break;
            case 4000:
                g.html(a + "PS3");
                break;
            case 4001:
                g.html(a + "PS4");
                break;
            case 4002:
                g.html(a + "Bravia");
                break
        }
        if (Debug.enabled) {
            g.show().css("visibility", "visible")
        }
        if (window.platform && window.platform.getDeviceId) {
            Main.deviceId = window.platform.getDeviceId()
        } else {
            if (typeof TVA_Widevine != "undefined") {
                Main.deviceId = TVA_Widevine.getESN()
            }
        }
        Main.timeOffset = new Date().getTimezoneOffset() * -1;
        View.loaderInit();
        PopMsg.init();
        API.authDevice(function() {
            API.getStorefrontOps()
        });
        Footer.init();
        var c = [];
        c.push({
            text: "Menu",
            className: "zero-button-footer",
            keycode: TVA.tvKey.KEY_0,
            method: function() {
                if (View.actualPage === VideoPlayer) {
                    VideoControls.showControls();
                    VideoControls.hideMe(false)
                }
                Header.setFocus();
                return false
            }
        });
        c.push({
            text: "Volver",
            className: "return-button-footer",
            keycode: TVA.tvKey.KEY_RETURN,
            method: function() {
                if (View.actualFocus == "side-panel-container" || View.actualFocus == "side-panel-container-video") {
                    SidePanel.hideMe(true);
                    View.actualPage.setFocus()
                } else {
                    View.previousPage(false, true)
                }
                return false
            }
        });
        Footer.setRight(c);
        Main.updateShortcuts();
        window.setTimeout(Commons.hideVersion, 5000);
        $(".time-line").click(function(i) {
            var h = i.pageX - i.target.offsetLeft;
            VideoPlayer.seekTo(100 * h / $(".time-line").width())
        });
        if (typeof window.testmd5 === "function") {
            window.testmd5()
        }
    },
    unload: function(a) {
        if (!Main.unloaded) {
            Main.unloaded = true;
            try {
                VideoControls.stop()
            } catch (b) {}
            if (a === true) {
                return
            }
            try {
                TVA.quit()
            } catch (b) {}
        }
    },
    keyHistory: [],
    keyHistoryMaxLength: 10,
    updateShortcuts: function() {
        try {
            Main.SHORTCUT_DEBUG_ON = [TVA.tvKey.KEY_DOWN, TVA.tvKey.KEY_LEFT, TVA.tvKey.KEY_8, TVA.tvKey.KEY_PAUSE, TVA.tvKey.KEY_9, TVA.tvKey.KEY_4].reverse();
            Main.SHORTCUT_LOGOUT = [TVA.tvKey.KEY_DOWN, TVA.tvKey.KEY_RIGHT, TVA.tvKey.KEY_8, TVA.tvKey.KEY_STOP, TVA.tvKey.KEY_8, TVA.tvKey.KEY_3].reverse();
            Main.SHORTCUT_SHOW_INFOBAR_CLOCK = [TVA.tvKey.KEY_DOWN, TVA.tvKey.KEY_UP, TVA.tvKey.KEY_GREEN, TVA.tvKey.KEY_RIGHT, TVA.tvKey.KEY_UP].reverse();
            Main.SHORTCUT_NO_HW_BLITTING = [TVA.tvKey.KEY_RW, TVA.tvKey.KEY_STOP, TVA.tvKey.KEY_FF, TVA.tvKey.KEY_PAUSE].reverse();
            Main.SHORTCUT_NO_DRM_1 = [TVA.tvKey.KEY_1, TVA.tvKey.KEY_RIGHT, TVA.tvKey.KEY_LEFT, TVA.tvKey.KEY_LEFT].reverse();
            Main.SHORTCUT_NO_DRM_2 = [TVA.tvKey.KEY_2, TVA.tvKey.KEY_RIGHT, TVA.tvKey.KEY_LEFT, TVA.tvKey.KEY_LEFT].reverse();
            Main.SHORTCUT_NO_DRM_DEFAULT = [TVA.tvKey.KEY_9, TVA.tvKey.KEY_RIGHT, TVA.tvKey.KEY_LEFT, TVA.tvKey.KEY_LEFT].reverse()
        } catch (a) {}
    },
    keyHistoryMatches: function(b) {
        if (typeof b === "undefined" || b.length > this.keyHistory.length) {
            return false
        }
        for (var a = 0; a < b.length; a++) {
            if (b[a] != this.keyHistory[a]) {
                return false
            }
        }
        this.keyHistory = [];
        return true
    },
    keyDown: function(j) {
        try {
            this.keyHistory.unshift(j);
            if (this.keyHistory.length > this.keyHistoryMaxLength) {
                this.keyHistory.splice(this.keyHistoryMaxLength, this.keyHistory.length - this.keyHistoryMaxLength)
            }
        } catch (b) {}
        if (View.actualPage === VideoPlayer && View.actualFocus != "side-panel-container" && View.actualFocus != "side-panel-container-video") {
            VideoControls.lastButtonPress = Utils.now()
        }
        if (Debug.enabled) {
            switch (j) {
                case TVA.tvKey.KEY_6:
                    try {
                        if (TVA.device == "ps3" && window.platform.ver == 4) {
                            break
                        }
                    } catch (h) {}
                    Debug.toggle();
                    break;
                case TVA.tvKey.KEY_9:
                    Main.unload();
                    break
            }
        }
        if (View.loaderDepth == 0) {
            var c = Header.handleSpecialKeys(j);
            if (c === true) {
                TVA.invalidate();
                return false
            } else {
                if (typeof c == "number") {
                    j = c
                }
            }
            var a = true;
            if (View.actualPage === PopUp || PopUp.isVisible == true) {
                PopUp.keyHandler(j);
                a = false
            } else {
                if (View.actualFocus === "side-panel-container") {
                    a = SidePanel.keyHandler(j)
                }
            }
            if (a == true) {
                var d = [TVA.tvKey.KEY_RETURN, TVA.tvKey.KEY_ENTER, TVA.tvKey.KEY_PLAY, TVA.tvKey.KEY_DOWN, TVA.tvKey.KEY_UP, TVA.tvKey.KEY_RIGHT, TVA.tvKey.KEY_LEFT, TVA.tvKey.KEY_0, TVA.tvKey.KEY_1, TVA.tvKey.KEY_2, TVA.tvKey.FN_12, TVA.tvKey.KEY_RED, TVA.tvKey.KEY_GREEN, TVA.tvKey.KEY_YELLOW, TVA.tvKey.KEY_BLUE];
                var i = true;
                if (d.indexOf(j) >= 0) {
                    i = Footer.keyHandler(j)
                }
                if (i) {
                    if (View.actualFocus === "header" && View.actualPage !== PopUp) {
                        i = Header.keyHandler(j)
                    } else {
                        if (TVA.GUI.FOCUS_FOOTER === true && View.actualFocus === "footer" && View.actualPage !== PopUp) {
                            i = Footer.keyHandler(j)
                        }
                    }
                    if (i == true) {
                        if (TVA.GUI.FOCUS_FOOTER !== true) {
                            View.actualPage.keyHandler(j)
                        } else {
                            if (View.actualPage) {
                                var f = View.actualFocus;
                                var k = LeftPanel.actualItem + ProgramGrid.actualChannel + GridPanel.row + ThumbSlider.actualThumb;
                                View.actualPage.keyHandler(j);
                                var g = LeftPanel.actualItem + ProgramGrid.actualChannel + GridPanel.row + ThumbSlider.actualThumb;
                                if (f == View.actualFocus && j == TVA.tvKey.KEY_DOWN && View.actualPageIs(VideoPlayer) == false && View.actualPageIs(PopUp) == false && View.actualFocus !== "big-slider" && g == k) {
                                    Footer.setFocus("directo")
                                }
                            }
                        }
                    }
                }
            }
        } else {
            if (j == TVA.tvKey.KEY_RETURN) {
                Main.falseKeypressCounter++
            }
            if (Main.falseKeypressCounter > 3) {
                Main.falseKeypressCounter = 0;
                View.loaderDepth = 0;
                View.loaderHide();
                View.changeView(Home)
            }
        }
        return true
    }
};
var Debug = {
    enabled: false,
    element: false,
    elementVisible: false,
    init: function(a) {
        Debug.enable(a);
        Debug.element = $("#debugLog");
        if (a === true) {
            Debug.element.show()
        } else {
            Debug.element.hide()
        }
    },
    enable: function(a) {
        Debug.enabled = a
    },
    logMessages: [],
    maxLogMessages: 40,
    log: function(d, b) {
        if (TVA.OTT.DLU != "") {
            var a = new XMLHttpRequest();
            a.open("GET", TVA.OTT.DLU + encodeURIComponent(d), true);
            a.send()
        }
        if (Debug.enabled) {
            d = d.replace("<", "&lt;");
            if (typeof b === "string") {
                d = b + d
            }
            try {
                this.logMessages.unshift("<p>" + d + "</p>");
                if (this.logMessages.length > this.maxLogMessages) {
                    this.logMessages.splice(this.maxLogMessages, this.logMessages.length - this.maxLogMessages)
                }
                TVA.putInnerHTML(Debug.element.get(0), this.logMessages.join("\n"))
            } catch (c) {}
        }
    },
    error: function(a) {
        Debug.err(a)
    },
    err: function(a) {
        if (Debug.enabled && typeof a === "string" && a.length > 0) {}
    },
    warning: function(a) {
        Debug.warn(a)
    },
    warn: function(a) {
        if (Debug.enabled && typeof a === "string" && a.length > 0) {}
    },
    fatal: function(a) {
        if (Debug.enabled && typeof a === "string" && a.length > 0) {}
    },
    show: function() {
        Debug.enable(true);
        Debug.elementVisible = true;
        Debug.element.show()
    },
    toggle: function() {
        var a = $("#platform-id");
        if (!Debug.elementVisible) {
            Debug.element.show();
            a.show()
        } else {
            Debug.element.hide();
            a.hide()
        }
        Debug.elementVisible = !Debug.elementVisible
    }
};
var MouseWheel = {
    initialized: false,
    init: function() {
        if (this.initialized == true) {
            return
        }
        this.initialized = true;
        try {
            document.onmousewheel = MouseWheel.onMouseWheel
        } catch (a) {}
    },
    preventDefault: function() {},
    onMouseWheel: function(a) {
        var b = 0;
        if (!a) {
            a = window.event
        }
        if (a.wheelDelta) {
            b = a.wheelDelta
        } else {
            if (a.detail) {
                b = -a.detail
            }
        }
        if (b > 0) {
            TVA.keyDown({
                keyCode: TVA.tvKey.KEY_UP,
                preventDefault: MouseWheel.preventDefault
            })
        } else {
            if (b < 0) {
                TVA.keyDown({
                    keyCode: TVA.tvKey.KEY_DOWN,
                    preventDefault: MouseWheel.preventDefault
                })
            }
        }
    }
};
Main.switchDRM = function(d) {
    try {
        if (d === null || d < -1) {
            return false
        }
        var b = TVA.OTT.ORIGINALDRMS;
        if (!b) {
            b = JSON.parse(JSON.stringify(TVA.OTT.DRM));
            TVA.OTT.ORIGINALDRMS = JSON.parse(JSON.stringify(TVA.OTT.DRM))
        }
        if (d == -1) {
            var c = totalChannelStorage.getItem("ott.drm");
            if (c !== null && typeof c === "string" && c !== "") {
                try {
                    c = JSON.parse(c);
                    if (typeof c !== "object") {
                        c = null
                    }
                } catch (f) {
                    c = null
                }
            }
            if (typeof c == "object" && c !== null && c.length > 0) {
                b = c
            }
        }
        if (!b) {
            b = JSON.parse(JSON.stringify(TVA.OTT.DRM));
            TVA.OTT.ORIGINALDRMS = JSON.parse(JSON.stringify(b))
        } else {
            b = JSON.parse(JSON.stringify(b))
        }
        if (b.length > 1 && (d <= 0 || d - 1 < b.length)) {
            if (d > 0) {
                b.splice(d - 1, 1)
            }
            TVA.OTT.DRM = b;
            var a = JSON.stringify(TVA.OTT.DRM);
            if (d !== -1) {
                Alert.show(JSON.stringify(TVA.OTT.DRM));
                totalChannelStorage.setItem("ott.drm", a);
                return true
            }
        } else {
            if (d <= 0 && b.length == 1) {
                TVA.OTT.DRM = b
            }
        }
    } catch (f) {}
    return false
};
Main.setBackgroundStatus = function(a) {
    Main._checkBackgroundStatus(a, false)
};
Main.checkStatus = function() {
    Main._checkBackgroundStatus(false, true)
};
Main._checkBackgroundStatus = function(b, a) {
    Main.isInBackground = (b === true);
    if (Main.isInBackground == true) {
        TVA.setBackgroundStatus(b)
    } else {
        if (Main.unloaded == true) {
            Main.onLoad();
            TVA.setBackgroundStatus(b)
        } else {
            var c = Main.username;
            if (a == false) {
                $(".page").hide()
            }
            View.loaderShow();
            API.authDeviceCheck(c, function() {
                $(".page").show();
                View.loaderHide();
                TVA.setBackgroundStatus(b)
            }, Main.authDeviceReload)
        }
    }
};
Main.authDeviceReload = function() {
    API.reloading = true;
    Main.isInBackground = true;
    try {
        API.cancelAllRequests()
    } catch (a) {}
    Main.unload(true);
    setTimeout(function() {
        API.reloading = true;
        Main.onLoad();
        $(".page").show();
        View.loaderHide();
        TVA.setBackgroundStatus(status)
    }, 2000);
    Main.isInBackground = false
};
try {
    if (!console) {
        console = {
            log: function(a) {}
        }
    } else {
        if (typeof console.log == "undefined") {
            console.log = function() {}
        } else {}
    }
} catch (cex) {};
var Utils = {
    weekday: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    weekDayAbbreviation: ["Dom.", "Lun.", "Mar.", "Mier.", "Jue.", "Vier.", "Sab."],
    month: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    monthAbbreviation: ["En.", "Febr.", "Mzo.", "Abr.", "My.", "Jun.", "Jul.", "Ag.", "Sept.", "Oct.", "Nov.", "Dic."],
    now: function() {
        var a = new Date();
        return a.getTime()
    },
    getDateObj: function(g) {
        try {
            var f = g.split("T");
            var c = f[0].split("-");
            var a = f[1].split(":");
            var h = new Date(c[0], c[1] - 1, c[2], a[0], a[1]);
            h.setMinutes(h.getMinutes() + Main.timeOffset);
            return h
        } catch (b) {
            return false
        }
    },
    getTimeStr: function(d) {
        if (isNaN(d)) {
            return "--:--"
        }
        var c = Math.floor((d % 86400) / 3600);
        var a = Math.floor(((d % 86400) % 3600) / 60);
        var b = Math.floor(((d % 86400) % 3600) % 60);
        return c + ":" + Utils.checkTimeStr(a) + ":" + Utils.checkTimeStr(b)
    },
    getSecondsBetweenDates: function(c, a) {
        if (c && a) {
            var b = c.getTime() - a.getTime();
            return (Math.abs(b / 1000))
        } else {
            return 0
        }
    },
    checkTimeStr: function(a) {
        return ((a < 10) ? "0" + a : a)
    },
    findAsset: function(d, b) {
        var a = DataStore.get(Type.Program, d);
        if (a.asset) {
            return a.asset
        } else {
            var c = DataStore.get(Type.Event, b);
            if (c.asset) {
                return c.asset
            }
        }
        return false
    },
    isNumber: function(a) {
        return !isNaN(parseFloat(a)) && isFinite(a)
    }
};
Object.size = function(c) {
    var b = 0,
        a;
    for (a in c) {
        if (c.hasOwnProperty(a)) {
            b++
        }
    }
    return b
};
Utils.getZoom = function() {
    if (TVA.zoomMargins == null) {
        return 1
    }
    var c = 1;
    try {
        var a = $("#body");
        var d = a.css("transform");
        if (d === null) {
            d = a.css("-webkit-transform")
        }
        c = Math.abs(parseFloat(d.split("(")[1].split(",")[0]))
    } catch (b) {
        c = 1
    }
    return c
};
Utils.setZoom = function(d) {
    if (TVA.zoomMargins == null) {
        return
    }
    var a = 1;
    if (d < 0) {
        a = Utils.getZoom() - TVA.zoomMargins.step
    } else {
        if (d > 0) {
            a = Utils.getZoom() + TVA.zoomMargins.step
        } else {
            try {
                a = parseFloat(totalChannelStorage.getItem("zoom"));
                if (isNaN(a)) {
                    return
                }
            } catch (c) {
                a = 1
            }
        }
    }
    a = Math.round(a * 100) / 100;
    if (a > TVA.zoomMargins.max) {
        a = TVA.zoomMargins.max
    }
    if (a < TVA.zoomMargins.min) {
        a = TVA.zoomMargins.min
    }
    var b = $("#body");
    b.css("transform", "scale(" + a + ")");
    b.css("-webkit-transform", "scale(" + a + ")");
    totalChannelStorage.setItem("zoom", a)
};
Utils.initZoom = function() {
    if (TVA.zoomMargins != null) {
        Utils.setZoom(0)
    }
};
Utils.isHLS = function(b) {
    var a = b.split("?");
    a = a[0];
    a = a.split(".");
    a = a[a.length - 1];
    a = a.toLowerCase();
    return (a == "m3u" || a == "m3u8")
};
Utils.getFileName = function(a) {
    a = a.substring(0, (a.indexOf("#") == -1) ? a.length : a.indexOf("#"));
    a = a.substring(0, (a.indexOf("?") == -1) ? a.length : a.indexOf("?"));
    a = a.substring(a.lastIndexOf("/") + 1, a.length);
    return a
};
Utils.setBlitting = function(b) {
    var a = totalChannelStorage.getItem("nohwblitting");
    if (b === true) {
        if (a == "1") {
            a = "0";
            $("body").removeClass("nohwblitting")
        } else {
            a = "1";
            $("body").addClass("nohwblitting")
        }
        totalChannelStorage.setItem("nohwblitting", a);
        return a
    } else {
        if (b === "1" || b === "0" || b === 1 || b === 0) {
            a = "" + b;
            totalChannelStorage.setItem("nohwblitting", a)
        }
    }
    if (a == "1") {
        $("body").addClass("nohwblitting")
    } else {
        $("body").removeClass("nohwblitting")
    }
    return a
};
Utils.UUID = function() {
    function b(h, e) {
        for (e = h = ""; h++ < 36; e += h * 51 & 52 ? (h ^ 15 ? 8 ^ Math.random() * (h ^ 20 ? 16 : 4) : 4).toString(16) : "-") {}
        return e
    }
    var a = "";
    try {
        try {
            a = b()
        } catch (g) {
            a = ""
        }
        if (!a || a == "" || a.length < 30) {
            var c = new Date().getTime();
            c += "-" + Math.random();
            try {
                a = window.md5(c)
            } catch (f) {
                a = c
            }
        }
    } catch (d) {}
    return a.toUpperCase()
};
var Base64 = {
    keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    decode: function(d) {
        var b = "";
        var l, j, g = "";
        var k, h, f, e = "";
        var c = 0;
        var a = /[^A-Za-z0-9\+\/\=]/g;
        if (a.exec(d)) {
            return ""
        }
        d = d.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        do {
            k = this.keyStr.indexOf(d.charAt(c++));
            h = this.keyStr.indexOf(d.charAt(c++));
            f = this.keyStr.indexOf(d.charAt(c++));
            e = this.keyStr.indexOf(d.charAt(c++));
            l = (k << 2) | (h >> 4);
            j = ((h & 15) << 4) | (f >> 2);
            g = ((f & 3) << 6) | e;
            b = b + String.fromCharCode(l);
            if (f != 64) {
                b = b + String.fromCharCode(j)
            }
            if (e != 64) {
                b = b + String.fromCharCode(g)
            }
            l = j = g = "";
            k = h = f = e = ""
        } while (c < d.length);
        return unescape(b)
    }
};
var ScreenSaver = {};
ScreenSaver.enable = function() {};
ScreenSaver.disable = function() {};
try {
    jQuery.support.cors = true
} catch (e) {}
var API = {
    base_url: TVA.OTT.BASEURL,
    image_base_url: "http://cloudfront-static.totalchannel.tv/epgres/",
    pairingTimeout: null,
    cookieValue: "",
    bbq: TVA.OTT.BBQ,
    timeout: 30000,
    requests: [],
    nRequests: 0,
    initialized: false,
    initializing: 0,
    numInitErrors: 0,
    auth: false,
    returnsDRM: null,
    goLive: false,
    configLoaded: false,
    lastCallbackId: [],
    init: function() {
        API.initialized = false;
        API.initializing = 0;
        API.numInitErrors = 0;
        API.returnsDRM = null;
        API.goLive = false;
        API.configLoaded = false;
        API.videoPlayerLoaded = false;
        API.lastCallbackId = []
    },
    call: function(c) {
        if (c && !c.data) {
            c.data = {}
        }
        c.data.bbq = API.bbq;
        if (c.url && (c.url.indexOf("play/asset") > 0 || c.url.indexOf("my-tv/recordings") > 0 || c.url.indexOf("my-tv/pending-recordings") > 0)) {
            c.data.deviceType = TVA.OTT.DEVICETYPE
        }
        if (c.errorWrapper) {
            var g = c.success;
            c.success = function(m, l, r) {
                try {
                    API.checkForErrors(m, c.emptyResponseAllowed);
                    g(m, l, r);
                    if (c.cached && c.cached > 0) {
                        APICache.saveData(c, {
                            data: m,
                            status: l,
                            xhr: r
                        })
                    }
                } catch (o) {
                    if (typeof o === "string") {
                        o = {
                            message: o
                        }
                    }
                    if (Debug.enabled) {
                        var j = "";
                        for (var k in o) {
                            if (o.hasOwnProperty(k)) {
                                j += "property: " + k + " value: [" + o[k] + "]\n"
                            }
                        }
                        j += "toString():  value: [" + o.toString() + "]"
                    }
                    if (o instanceof API.Exception || typeof o === "object") {
                        if (o.message == API.Exception.URL_NOT_FOUND) {
                            View.previousPage(true);
                            try {
                                if (m && m.data && m.data.pbId) {
                                    VideoPlayer.lastPlayerResponseVideo = {
                                        pbId: m.data.pbId
                                    }
                                }
                            } catch (n) {}
                            PopMsg.show("error", 47, "AP01");
                            return
                        } else {
                            if (o.message == API.Exception.API_ERROR) {
                                switch (PopUp.type) {
                                    case "pairing-login":
                                    case "pairing-alta":
                                        PopUp.handleLoginError(m);
                                        return;
                                        break
                                }
                            }
                        }
                    }
                    var q = r ? parseInt(r.errorCode) : 0;
                    if (q == 0 && r && r.jqSettings) {
                        q = r.jqSettings.errorCode
                    }
                    if (q == 47 || (r && r.jqSettings && r.jqSettings.url && r.jqSettings.url.indexOf("play/asset") > 0)) {
                        View.loaderHide();
                        View.previousPage()
                    }
                    if (r && r.errorPreAction) {
                        if (r.errorPreAction() === false) {
                            return
                        }
                    }
                    if (m && m.message && m.message !== "") {
                        PopMsg.showMessage("error", m.message)
                    } else {
                        if (m && m.error && m.error === "NOT_AVAILABLE") {
                            if (q >= 0) {
                                PopMsg.show("error", q)
                            } else {
                                PopMsg.showMessage("error", PopMsg.getText(47))
                            }
                        } else {
                            if (m && m.error && (m.error === "INVALID_SESSION" || m.error === "INVALID_STATE")) {
                                var p = (r && r.jqSettings && r.jqSettings.url && typeof r.jqSettings.url == "string") ? r.jqSettings.url : "";
                                if (p.indexOf("play/asset") > 0 || p.indexOf("my-tv/recordings") > 0 || p.indexOf("my-tv/pending-recordings") > 0) {
                                    API.reloading = true;
                                    PopMsg.show("error", 29)
                                } else {
                                    if (q >= 0) {
                                        PopMsg.show("error", q)
                                    }
                                }
                            } else {
                                if (q >= 0) {
                                    PopMsg.show("error", q)
                                }
                            }
                        }
                    }
                    if (r && r.errorPostAction) {
                        r.errorPostAction()
                    }
                }
            }
        }
        var f = "json";
        if (TVA.OTT.JSONREQUEST) {
            switch (TVA.OTT.JSONREQUEST) {
                case "json":
                case "jsonp":
                    f = TVA.OTT.JSONREQUEST;
                    break
            }
        }
        var h = c.url.replace(API.base_url, "").replace(/[^\w\s]/gi, "");
        if (!API.lastCallbackId.hasOwnProperty(h) || API.lastCallbackId[h] > 3) {
            API.lastCallbackId[h] = 1
        }
        h += (API.lastCallbackId[h]++);
        var a = {
            dataType: f,
            timeout: API.timeout,
            jsonpCallback: h,
            beforeSend: function(k, j) {
                k.jqSettings = j;
                if (j.errorCode) {
                    k.errorCode = j.errorCode
                } else {
                    k.errorCode = false
                }
                k.errorPreAction = null;
                if (j.errorPreAction) {
                    k.errorPreAction = j.errorPreAction
                }
                k.errorPostAction = null;
                if (j.errorPostAction) {
                    k.errorPostAction = j.errorPostAction
                }
                if (!j.hideLoader) {
                    if (!j.loaderIndex) {
                        View.loaderShow()
                    } else {
                        View.loaderShow(j.loaderIndex)
                    }
                }
            },
            complete: function(j) {
                if (!c.hideLoader) {
                    View.loaderHide()
                }
                API.removeRequest(j)
            },
            error: function(r, k) {
                var o = r ? r.responseText : null;
                var p = r ? r.errorCode : null;
                var m = r ? r.errorPreAction : null;
                var q = r ? r.errorPostAction : null;
                var l = null;
                if (o) {
                    try {
                        l = JSON.parse(o)
                    } catch (n) {}
                }
                try {
                    var j = r.jqSettings;
                    API.removeRequest(r);
                    if (j.errorWrapper == false || j.url.indexOf("/evt/pb?") > 0 || j.url.indexOf("/guide/pf?") > 0) {
                        return
                    }
                } catch (n) {}
                if (k === "timeout") {
                    switch (PopUp.type) {
                        case "pairing-login":
                        case "pairing-alta":
                            PopUp.handleLoginError(l);
                            return;
                            break
                    }
                    if (View.actualPageIs(VideoPlayer) && j.url.indexOf("/play/asset") > 0) {
                        View.previousPage();
                        PopMsg.show("error", 51, "AP02");
                        return
                    }
                    View.loaderHide();
                    PopUp.showMe("error", false, PopMsg.getText(51));
                    View.changeView(PopUp)
                } else {
                    if (p === 47 || (j && j.errorCode == 47)) {
                        View.loaderHide();
                        View.previousPage()
                    }
                    if (m) {
                        if (m() === false) {
                            return
                        }
                    }
                    if (l && l.error && l.error === "DEVICE_NEEDS_PAIRING") {
                        if (Main.username && typeof Main.username === "string" && Main.username.length > 0) {
                            setTimeout("Main.checkStatus();", 1000)
                        } else {
                            API.startPairing()
                        }
                    } else {
                        if (l && l.error && l.reason && l.error === "NO_QUOTA") {
                            if (!l.message) {
                                l.message = "Se ha excedido el número de horas de reproducción";
                                if (l.reason === "FT_EXCEEDED") {
                                    l.message += " para la suscripción FreeTrial"
                                }
                            }
                            View.previousPage();
                            PopMsg.showMessage("error", l.message + ".")
                        } else {
                            if (l && l.message) {
                                PopMsg.showMessage("error", l.message)
                            } else {
                                if (p && p >= 0) {
                                    PopMsg.show("error", p)
                                } else {
                                    if (j && j.errorCode >= 0) {
                                        PopMsg.show("error", j.errorCode)
                                    }
                                }
                            }
                        }
                    }
                    if (q) {
                        q()
                    }
                }
            }
        };
        if (a.dataType == "jsonp") {
            jQuery.extend(a, {
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true
            })
        }
        jQuery.extend(c, a);
        var b = null;
        if (c.cached && c.cached > 0) {
            b = APICache.getData(c);
            if (b !== null) {
                c.beforeSend(b.xhr, c);
                setTimeout(function() {
                    c.success(b.data, b.status, b.xhr);
                    setTimeout(function() {
                        c.complete(b.xhr, b.status)
                    }, 10)
                }, 10);
                return null
            }
        }
        var i = this.nRequests++;
        c.apiId = i;
        var d = $.ajax(c);
        if (d) {
            d.apiId = i;
            this.requests.push(d)
        }
        return d
    },
    cancelAllRequests: function() {
        try {
            for (var a in this.requests) {
                if (this.requests.hasOwnProperty(a)) {
                    try {
                        this.requests[a].errorCode = -1
                    } catch (d) {}
                    try {
                        this.requests[a].abort()
                    } catch (d) {}
                    var b = this.requests.splice(a, 1)
                }
            }
            if (API.getSliderContentRequest) {
                API.getSliderContentRequest.errorCode = -1;
                API.getSliderContentRequest = null
            }
        } catch (c) {}
    },
    removeRequest: function(d) {
        try {
            if (!d) {
                return
            }
            var b = d.jqSettings;
            for (var a in this.requests) {
                if (this.requests.hasOwnProperty(a)) {
                    if (this.requests[a].apiId == b.apiId) {
                        this.requests.splice(a, 1)
                    }
                }
            }
        } catch (c) {}
        try {
            if (d.destroy) {
                d.destroy()
            }
        } catch (c) {}
    },
    checkForErrors: function(b, a) {
        if (arguments.length != 2) {
            throw new API.Exception(API.Exception.NOT_ENOUGH_ARGS)
        } else {
            if (!a && (b === "" || b === undefined || typeof b === "undefined" || b == null)) {
                throw new API.Exception(API.Exception.EMPTY_RESPONSE)
            } else {
                if (b && b.error) {
                    throw new API.Exception(API.Exception.API_ERROR, b.error)
                }
            }
        }
    },
    getInfoTxt: function() {
        var a = "";
        try {
            a = TVA.getInfo()
        } catch (b) {
            a = ""
        }
        return a
    },
    authDevice: function(b) {
        API.getDeviceId();
        var a = API.getInfoTxt();
        var c = API.call({
            url: API.base_url + "auth/device",
            data: {
                deviceId: Main.deviceId,
                deviceType: TVA.OTT.DEVICETYPE,
                year: TVA.year,
                info: a
            },
            errorWrapper: true,
            errorCode: 29,
            emptyResponseAllowed: true,
            hideLoader: true,
            success: function(f, d, g) {
                if (g && g.status == 200) {
                    API.initialized = true
                }
                if (g && g.status != 0) {
                    API.authSuccess(f, d, g, b);
                    API.goLive = true
                }
            }
        })
    },
    authDeviceCheck: function(c, b, f) {
        API.getDeviceId();
        var a = API.getInfoTxt();
        var d = API.call({
            url: API.base_url + "auth/device",
            data: {
                deviceId: Main.deviceId,
                deviceType: TVA.OTT.DEVICETYPE,
                year: TVA.year,
                info: a,
                deviceCheck: true
            },
            errorWrapper: true,
            errorCode: -1,
            emptyResponseAllowed: true,
            hideLoader: true,
            success: function(h, g, i) {
                if (i && i.status == 200) {
                    var j = DataStore.getFromObject(h, "data_userName", "");
                    if (j && j == c) {
                        b()
                    } else {
                        f()
                    }
                } else {
                    f()
                }
            },
            errorPreAction: function() {
                f();
                return false
            }
        })
    },
    voidFn: function() {},
    getConfig: function(b) {
        var a = API.call({
            url: API.base_url + "config",
            data: {
                view: "all",
                ver: "2",
                deviceType: TVA.OTT.DEVICETYPE
            },
            errorWrapper: false,
            errorCode: -1,
            emptyResponseAllowed: true,
            error: function() {
                API.configLoaded = true;
                if (TVA.device === "ps3") {
                    setTimeout("API.getPromotions(0);", 500)
                }
            },
            errorPostAction: function() {
                API.configLoaded = true
            },
            success: function(k, i, q) {
                var d = 2880;
                var o = null;
                var p;
                try {
                    if (k && k.data) {
                        var c = k.data;
                        if (c.ttl) {
                            d = c.ttl
                        }
                        if (c.beacon) {
                            var r = parseInt(c.beacon);
                            if (r > 0) {
                                EVT.beaconInterval = r * 1000
                            }
                        }
                        if (typeof c.auth !== "undefined") {
                            API.auth = API.getBoolFromConfig(c.auth, API.auth)
                        }
                        if (typeof c.analytics !== "undefined") {
                            OTTAnalytics.enabled = API.getBoolFromConfig(c.analytics, OTTAnalytics.enabled);
                            if (OTTAnalytics.enabled == false) {
                                TVA.OTT.NICEBALANCER = false;
                                TVA.OTT.NICETOKEN = "";
                                TVA.OTT.OTTBALANCER = false
                            }
                        }
                        if (typeof c.balancer !== "undefined") {
                            if (typeof c.balancer.code !== "undefined") {
                                TVA.OTT.ACODE = c.balancer.code
                            }
                            if (typeof c.balancer.ott !== "undefined") {
                                TVA.OTT.OTTBALANCER = API.getBoolFromConfig(c.balancer.ott, TVA.OTT.OTTBALANCER)
                            }
                            if (typeof c.balancer.nice !== "undefined") {
                                TVA.OTT.NICEBALANCER = API.getBoolFromConfig(c.balancer.nice, TVA.OTT.NICEBALANCER)
                            }
                            if (typeof c.balancer.token !== "undefined") {
                                TVA.OTT.NICETOKEN = c.balancer.token
                            }
                            if (typeof c.balancer.ocode !== "undefined") {
                                TVA.OTT.ORIGINCODE = c.balancer.ocode
                            }
                        }
                        if (typeof c.vodSubtitlesDisabled !== "undefined") {
                            Subtitles.DISABLED = API.getBoolFromConfig(c.vodSubtitlesDisabled, Subtitles.DISABLED)
                        } else {
                            if (typeof c.subtitlesDisabled !== "undefined") {
                                Subtitles.DISABLED = API.getBoolFromConfig(c.subtitlesDisabled, Subtitles.DISABLED)
                            }
                        }
                        if (typeof c.audioTracksDisabled !== "undefined") {
                            TVA_Player.multipleVodAudioTracksDisabled = API.getBoolFromConfig(c.audioTracksDisabled, TVA_Player.multipleVodAudioTracksDisabled);
                            TVA_Player.multipleLiveAudioTracksDisabled = API.getBoolFromConfig(c.audioTracksDisabled, TVA_Player.multipleLiveAudioTracksDisabled)
                        }
                        if (typeof c.vodAudioTracksDisabled !== "undefined") {
                            TVA_Player.multipleVodAudioTracksDisabled = API.getBoolFromConfig(c.vodAudioTracksDisabled, TVA_Player.multipleVodAudioTracksDisabled)
                        }
                        if (typeof c.liveAudioTracksDisabled !== "undefined") {
                            TVA_Player.multipleLiveAudioTracksDisabled = API.getBoolFromConfig(c.liveAudioTracksDisabled, TVA_Player.multipleLiveAudioTracksDisabled)
                        }
                        if (typeof c.subtitlesLimit !== "undefined" && Subtitles.DISABLED == false) {
                            var f = parseInt(c.subtitlesLimit);
                            if (!isNaN(f) && f >= 0) {
                                Subtitles.tracksLimit = f
                            }
                        }
                        if (typeof c.view !== "undefined") {
                            o = c.view
                        }
                        if (typeof c.liveId !== "undefined") {
                            p = c.liveId
                        }
                        if (typeof c.showErrorCode !== "undefined") {
                            PopMsg.showErrorCode = API.getBoolFromConfig(c.showErrorCode, PopMsg.showErrorCode)
                        }
                        if (typeof c.log !== "undefined") {
                            if (typeof c.log.strlen !== "undefined") {
                                Messenger.STR_LEN = API.getIntFromConfig(c.log.strlen, Messenger.STR_LEN)
                            }
                            if (typeof c.log.buflen !== "undefined") {
                                Messenger.BUF_LEN = API.getIntFromConfig(c.log.buflen, Messenger.BUF_LEN)
                            }
                        }
                    }
                } catch (l) {}
                View.processConfig(o);
                var j = 10;
                if (TVA.device === "ps3") {
                    j = 2000
                }
                try {
                    if (document.location.href.toLowerCase().indexOf("nolive") > 0) {
                        API.goLive = false
                    }
                } catch (n) {}
                API.nextStepFunction = null;
                if (API.reloading === true) {
                    API.goLive = false
                }
                var m = false;
                if (b == true && API.auth == true && Main.username == "") {
                    m = true;
                    $("#big-slider").removeClass("big-slider-starttup");
                    API.startPairing(false, function() {
                        API.nextStepFunction = function() {
                            API.videoPlayerLoaded = true;
                            API.startPairingFn = null;
                            if (API.goLive == true && typeof p !== "undefined") {
                                setTimeout(function() {
                                    API.getChannels("direct-start", -1, p)
                                }, j)
                            }
                        };
                        if (PopUp.showTutorial() == false && API.nextStepFunction != null) {
                            API.nextStepFunction();
                            API.nextStepFunction = null
                        }
                    });
                    API.configLoaded = true
                } else {
                    if (API.goLive == true && typeof p !== "undefined" && API.videoPlayerLoaded !== true) {
                        API.nextStepFunction = function() {
                            setTimeout(function() {
                                API.getChannels("direct-start", -1, p)
                            }, j);
                            API.videoPlayerLoaded = true
                        }
                    } else {
                        $("#big-slider").removeClass("big-slider-starttup");
                        API.configLoaded = true
                    }
                }
                var h = d;
                if (d <= 0 || d > 3600) {
                    d = 3600
                }
                if (API.nopActionInterval != null) {
                    try {
                        clearInterval(API.nopActionInterval)
                    } catch (g) {}
                    API.nopActionInterval = null
                }
                API.nopActionInterval = setInterval(API.nopAction, d * 1000);
                if (TVA.device === "ps3") {
                    setTimeout("API.getPromotions(0);", 500)
                }
                if (OTTAnalytics.enabled == true && typeof youboraData == "undefined") {
                    OTTAnalytics.enabled = false
                }
                if (OTTAnalytics.enabled == false) {
                    if (typeof youboraData != "undefined") {
                        if (youboraData.setMediaResource) {
                            youboraData.setMediaResource("")
                        } else {
                            youboraData.mediaResource = ""
                        }
                    }
                }
                if (m == false && PopUp.showTutorial() == false && API.nextStepFunction != null) {
                    API.nextStepFunction();
                    API.nextStepFunction = null
                }
            }
        })
    },
    getIntFromConfig: function(b, a) {
        try {
            var d = parseInt(b);
            if (isNaN(d) || d <= 0) {
                d = a
            }
        } catch (c) {
            d = a
        }
        return d
    },
    getBoolFromConfig: function(b, a) {
        if (typeof b === "boolean") {
            return b
        } else {
            if (typeof b === "string") {
                return (b.toLowerCase() == "true")
            } else {
                if (typeof b === "number") {
                    return (b > 0)
                }
            }
        }
        return a
    },
    nopActionInterval: null,
    nopAction: function() {
        var a = API.call({
            url: API.base_url + "nop",
            errorWrapper: false,
            errorCode: -1,
            emptyResponseAllowed: true,
            success: function(c, b, d) {}
        })
    },
    authSuccess: function(g, d, j, i) {
        var b = false,
            c = false;
        var f = DataStore.getFromObject(g, "data_userName", "");
        if (f) {
            b = true;
            var h = f.split(" ");
            if (h.length == 2 && h[0] == h[1]) {
                f = h[0]
            }
            Main.username = f;
            Footer.setUser(f);
            $(".header-menu-last").addClass("hidden-header-element").addClass("hide-this");
            ThumbSliderFilter.setOptions("home-logged-in");
            if (API.pairingTimeout != null || PopUp.type == "pairing-login" || PopUp.type == "pairing" || PopUp.type == "pairing-alta") {
                clearInterval(API.pairingTimeout);
                API.pairingTimeout = null;
                c = true;
                View.changeView(Home)
            }
            OTTAnalytics.authOk(DataStore.getFromObject(g, "data_duid", f));
            if (TVA.device === "ps3") {
                setTimeout("API.getConfig(false);", 1000)
            } else {
                API.getConfig(false)
            }
        } else {
            if (View.actualPage !== PopUp) {
                ThumbSliderFilter.setOptions("home-not-logged-in");
                var a = $(".header-menu-last");
                if (a) {
                    a.removeClass("hidden-header-element")
                }
                if (TVA.device === "ps3") {
                    setTimeout("API.getConfig(true);", 1000)
                } else {
                    API.getConfig(true)
                }
            }
        }
        if (View.actualPage !== PopUp && c == false) {
            View.changeView(Home)
        }
        if (i) {
            i()
        }
        if (d == 200) {
            setTimeout("API.startPairingFn();", 500)
        }
        return b
    },
    videoPlayerLoaded: false,
    startPairingFn: null,
    startPairing: function(a, b) {
        if (TVA.OTT.PAIRING === false) {
            if (View.actualPageIs(VideoPlayer)) {
                View.previousPage()
            }
            PopUp.showMe("pairing", false, "");
            PopUp.setCode("");
            View.changeView(PopUp);
            return
        }
        API.startPairingFn = b;
        if (a !== false) {
            API.auth = false
        } else {}
        $("#ventana").removeClass("ventana_login");
        $(".salir").removeClass("ventana_login");
        var c = API.call({
            url: API.base_url + "auth/pair",
            data: {},
            errorWrapper: true,
            errorCode: 33,
            emptyResponseAllowed: false,
            success: function(f) {
                var d = DataStore.getFromObject(f, "data", false);
                var g = DataStore.getFromObject(f, "message", false);
                if (d && g) {
                    if (View.actualPageIs(VideoPlayer)) {
                        View.previousPage()
                    }
                    PopUp.showMe("pairing", false, g);
                    PopUp.setCode(d);
                    View.changeView(PopUp);
                    clearInterval(API.pairingTimeout);
                    API.pairingTimeout = setInterval(API.authDevice, 10000)
                }
            }
        })
    },
    getPromotions: function(b) {
        var a = API.call({
            url: API.base_url + "promos/list",
            data: {
                bbq: API.bbq
            },
            errorWrapper: true,
            errorCode: 5,
            errorPreAction: function() {
                Header.setFocus();
                if (b === 0) {
                    setTimeout("API.getPromotions(1);", 1000);
                    return false
                }
                return true
            },
            emptyResponseAllowed: false,
            success: function(c) {
                Home.buildPromos(DataStore.parseAndStore(c))
            }
        })
    },
    getSliderContent: function(f, c, g, d) {
        var a = {
            bbq: API.bbq,
            nocache: Utils.now()
        };
        var b = f;
        var h = 26;
        if (f == "catch") {
            h = 26;
            b = "catch/child-programs";
            a.id = c
        } else {
            if (c !== "") {
                a.id = c
            }
            if (f == "related") {
                h = 26
            } else {
                if (f == "featured") {
                    h = 6
                } else {
                    if (f == "recommended") {
                        h = 7
                    } else {
                        if (f == "most-viewed") {
                            h = 14
                        } else {
                            if (f == "highest-rated") {
                                h = 15
                            } else {
                                if (f == "similar-programs") {
                                    h = 26
                                } else {
                                    if (f == "watch-now") {
                                        b = "catch";
                                        h = 26
                                    } else {
                                        if (f == "seasons") {
                                            h = 26
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (d) {
            a.channel = d
        }
        var k = b + JSON.stringify(a);
        try {
            if (API.getSliderContentQuery && API.getSliderContentQuery.url == k && API.getSliderContentQuery.data) {
                ThumbSlider.build(DataStore.parseAndStore(API.getSliderContentQuery.data));
                return true
            }
        } catch (j) {}
        try {
            if (API.getSliderContentRequest) {
                API.getSliderContentRequest.errorCode = -2;
                API.removeRequest(API.getSliderContentRequest);
                API.getSliderContentRequest = null
            }
        } catch (i) {}
        API.getSliderContentRequest = API.call({
            url: API.base_url + b,
            data: a,
            errorWrapper: true,
            errorCode: h,
            emptyResponseAllowed: true,
            cached: 0.5,
            errorPostAction: function() {
                API.getSliderContentRequest = null
            },
            success: function(m, l, n) {
                API.getSliderContentRequest = null;
                if (!n || n.errorCode == -2 || !m) {
                    ThumbSlider.sliderArrowsVisibility("hide");
                    if ((f == "catch" || f == "similar-programs") && View.actualPageIs(DataSheet)) {
                        $("#filter-thumbs0").addClass("hide-this");
                        ThumbSliderFilter.loadTab()
                    }
                    return
                }
                ThumbSlider.build(DataStore.parseAndStore(m));
                API.getSliderContentQuery = {
                    url: k,
                    data: m
                }
            }
        });
        return false
    },
    getChannels: function(g, c, f) {
        var b = "channels";
        if (g === "direct" || g === "direct-start" || g === "live") {
            VideoControls.lastButtonPress = 0;
            if (!VideoControls.isHidden && g === "live" && View.actualPage === VideoPlayer) {
                VideoControls.showLiveInfo = false;
                VideoControls.hideControls()
            }
            b = "channels/live";
            if (API.getChannelsLive) {
                if (Utils.now() - API.getChannelsLive.acess < 30000 && API.getChannelsLive.data) {
                    API.getChannelsLive.access = Utils.now();
                    var a = DataStore.parseAndStore(API.getChannelsLive.data);
                    if (a && a.length > 0) {
                        API.getChannelsCallback(g, a, c, f);
                        return true
                    }
                }
            }
        } else {
            if (g === "epg") {
                b = "channels"
            }
        }
        var d = API.call({
            url: API.base_url + b,
            data: {
                bbq: API.bbq,
                pf: 1
            },
            errorWrapper: true,
            errorCode: 1,
            emptyResponseAllowed: false,
            success: function(i) {
                var h = DataStore.parseAndStore(i);
                if (g === "direct" || g === "direct-start" || g === "live") {
                    if (h && h.length > 0) {
                        API.getChannelsLive = {
                            acess: Utils.now(),
                            data: i
                        }
                    }
                }
                API.getChannelsCallback(g, h, c, f)
            },
            errorPreAction: function() {
                API.configLoaded = true;
                return true
            }
        });
        return true
    },
    channelsCallbackMode: "",
    getChannelsCallback: function(h, g, a, b) {
        API.configLoaded = true;
        API.channelsCallbackMode = h;
        try {
            if (API.returnsDRM === null && API.getChannelsLive.data && API.getChannelsLive.data.data) {
                var f = API.getChannelsLive.data.data;
                API.returnsDRM = false;
                for (var c in f) {
                    if (f.hasOwnProperty(c)) {
                        var d = f[c];
                        if (d.hasOwnProperty("liveAsset") && d.liveAsset.hasOwnProperty("drms")) {
                            API.returnsDRM = true
                        }
                    }
                }
            }
        } catch (j) {}
        if (h === "direct-start") {
            a = -1
        }
        var i = VideoPlayer.getLive(g, a, b);
        if (h === "direct" || h === "direct-start") {
            DataStore.LiveChannels = g;
            VideoPlayer.setDetails("directo", {
                channelId: i.id,
                programId: null,
                eventId: null,
                assetId: i.liveAsset,
                isLive: true,
                directMode: (h === "direct-start")
            });
            totalChannelStorage.setItem("API.channel.id", i.id);
            View.changeView(VideoPlayer)
        } else {
            if (h === "live") {
                DataStore.LiveChannels = g;
                SidePanel.init({
                    displayItems: 7,
                    scrollLimit: 4,
                    modal: true,
                    classC: ((View.actualPage === VideoPlayer) ? "side-panel-home-videoplayer" : "side-panel-home")
                });
                SidePanel.build(g, i)
            } else {
                if (h === "epg") {
                    if (View.actualPageIs(EPG)) {
                        EPG.buildChannelGrid(g)
                    }
                }
            }
        }
    },
    getDetails: function(a, c) {
        var b = API.call({
            url: API.base_url + "details/" + a,
            data: {
                id: c
            },
            errorWrapper: true,
            errorCode: (View.actualPageIs(EPG) ? -1 : 28),
            emptyResponseAllowed: false,
            success: function(d) {
                if (View.actualPageIs(EPG)) {
                    EPG.buildDetails(DataStore.parseAndStore(d))
                } else {
                    DataSheet.build(DataStore.parseAndStore(d))
                }
            }
        })
    },
    getProgramDetails: function(a, b) {
        var c = API.call({
            url: API.base_url + "details/program",
            data: {
                id: a,
                channel: b
            },
            errorWrapper: true,
            errorCode: (View.actualPageIs(EPG) ? -1 : 28),
            emptyResponseAllowed: false,
            success: function(f, d, g) {
                if (View.actualPageIs(EPG)) {
                    EPG.buildDetails(DataStore.parseAndStore(f))
                } else {
                    DataSheet.build(DataStore.parseAndStore(f))
                }
            }
        })
    },
    getAsset: function(b) {
        var a = API.call({
            url: API.base_url + "play/asset",
            data: {
                id: b,
                drm: TVA.OTT.DRM.toString()
            },
            errorWrapper: true,
            errorCode: 47,
            emptyResponseAllowed: false,
            success: function(g) {
                g.id = b;
                VideoPlayer.isUHD = false;
                if (TVA.OTT.TEST_UHD == true) {
                    if (b == "b41a010ba3b60d7a" || b == "89c9c0e1a4104cb1") {
                        if (g.data["drm"]) {
                            VideoPlayer.isUHD = true;
                            g.data["drm"]["url"] = "http://h01.22a.cdn.imagina.tv/golt/golt_24h_4k/test.mpd";
                            g.data["drm"]["emmUrl"] = ""
                        }
                    }
                }
                var f = DataStore.parseAndStore(g);
                if (!f.url && f.drm && f.drm["url"]) {
                    f.url = f.drm["url"]
                }
                if (f.url) {
                    VideoPlayer.initPlayer(f, g)
                } else {
                    if (VideoPlayer.details.isLive && VideoPlayer.details.channelId) {
                        VideoPlayer.checkChannelError();
                        var d = DataStore.get(Type.Channel, VideoPlayer.details.channelId);
                        try {
                            if (g && g.data && g.data.pbId) {
                                VideoPlayer.lastPlayerResponseVideo = {
                                    pbId: g.data.pbId
                                }
                            }
                        } catch (c) {}
                        View.previousPage(true);
                        View.changeView(PopUp);
                        var h = d ? (d.name ? '"' + d.name + '"' : (d.abrev ? '"' + d.abrev + '"' : "")) : "";
                        PopUp.showMe("error", false, PopMsg.getText(52).replace("#CH#", h));
                        return
                    }
                    throw new API.Exception(API.Exception.URL_NOT_FOUND)
                }
            },
            errorPostAction: function() {
                VideoPlayer.checkChannelError()
            }
        });
        return true
    },
    getStorefrontOps: function() {
        var a = API.call({
            data: {
                bbq: API.bbq
            },
            url: API.base_url + "channel-content/categories",
            errorWrapper: true,
            errorCode: 46,
            emptyResponseAllowed: false,
            success: function(b) {
                Home.buildStorefronts(b.data)
            }
        })
    },
    getStorefrontFilters: function(b) {
        var a = API.call({
            url: API.base_url + "channel-content/ops",
            data: {
                cat: b,
                version: 2,
                bbq: API.bbq
            },
            errorWrapper: true,
            errorCode: 24,
            emptyResponseAllowed: false,
            cached: 2,
            success: function(d, c, f) {
                if (View.actualPageIs(Storefront)) {
                    Storefront.buildPage(2, d.data)
                }
            }
        })
    },
    getStorefrontChannels: function(d, b, a) {
        var c = API.call({
            url: API.base_url + "channel-content/rows",
            data: {
                op: b,
                arg: a,
                cat: d,
                bbq: API.bbq
            },
            errorWrapper: true,
            errorCode: 45,
            emptyResponseAllowed: false,
            cached: 2,
            success: function(g) {
                var f = DataStore.parseAndStore(g);
                if (View.actualPageIs(Storefront)) {
                    Storefront.buildPage(3, f, b, a)
                }
            }
        })
    },
    getStorefrontContent: function(g, c, f, h, a, b) {
        var d = API.call({
            url: API.base_url + "channel-content/contents",
            data: {
                cat: g,
                op: c,
                arg: a,
                row: f,
                bbq: API.bbq
            },
            errorWrapper: true,
            errorCode: 45,
            emptyResponseAllowed: true,
            cached: 2,
            success: function(j) {
                var i = DataStore.parseAndStore(j);
                if (View.actualPageIs(Storefront)) {
                    Storefront.buildPage(4, i, h);
                    if (typeof b !== "undefined") {
                        try {
                            b()
                        } catch (k) {}
                    }
                }
            }
        })
    },
    getCurrentLiveContent: function(c, b) {
        b = b || false;
        var a = API.call({
            url: API.base_url + "guide/pf",
            data: {
                id: c
            },
            errorWrapper: true,
            errorCode: -1,
            emptyResponseAllowed: false,
            hideLoader: b,
            success: function(k, d, l) {
                var j = DataStore.parseAndStore(k);
                var i = j[0];
                VideoPlayer.setDetails("live", {
                    channelId: VideoPlayer.details.channelId,
                    programId: i.program,
                    eventId: i.event,
                    assetId: VideoPlayer.details.assetId,
                    isLive: true,
                    directMode: false
                });
                VideoPlayer.setDetailsHTML();
                var h = DataStore.get(Type.Event, i.event);
                VideoPlayer.currentTotalSeconds = Utils.getSecondsBetweenDates(h.startTime, h.endTime);
                VideoPlayer.additionalSeconds = 0;
                var f = l.getResponseHeader("Date");
                var g = new Date();
                if (f) {
                    g = Date.parse(f)
                }
                VideoPlayer.additionalSeconds = Math.round(Utils.getSecondsBetweenDates(h.startTime, g));
                VideoPlayer.currentSecondsOff = VideoPlayer.currentSeconds
            }
        })
    },
    getDataListContent: function(c, a) {
        var b = API.call({
            url: API.base_url + "catch/child-programs",
            data: {
                extended: true,
                id: c.parentId
            },
            errorWrapper: true,
            errorCode: 20,
            emptyResponseAllowed: true,
            success: function(d) {
                if (View.actualPageIs(DataList)) {
                    if (!d || !d.data) {
                        if (c && (c.programId || c.eventId)) {
                            DataSheet.setDetails(c.programId, c.eventId, c.channelId, c.assetId);
                            View.changeView(DataSheet, false);
                            return
                        }
                    }
                    if (a == true) {
                        API.getDataListMasters(DataStore.parseAndStore(d), d)
                    } else {
                        DataList.appendToLeftPanel(DataStore.parseAndStore(d), d)
                    }
                }
            }
        });
        return false
    },
    getDataListMasters: function(d, f) {
        try {
            if (d && d.length && d[0]["program"]) {
                var c = null;
                if (f && f.data && f.data.length && f.data[0]["event"] && f.data[0]["event"]["channel"]) {
                    c = f.data[0]["event"]["channel"]["id"]
                }
                var h = DataStore.get(Type.Program, d[0]["program"]);
                if (c != null && h && h.master) {
                    var b = DataStore.get(Type.Program, h.master);
                    if (b && b.isMaster == true) {
                        var a = API.call({
                            url: API.base_url + "seasons",
                            data: {
                                channel: c,
                                id: h.master
                            },
                            errorWrapper: true,
                            errorCode: 20,
                            emptyResponseAllowed: true,
                            success: function(j) {
                                if (View.actualPageIs(DataList)) {
                                    var i = DataStore.parseAndStore(j);
                                    DataList.buildLeftPanel(d, i)
                                }
                            },
                            error: function() {
                                if (View.actualPageIs(DataList)) {
                                    DataList.buildLeftPanel(d)
                                }
                            }
                        });
                        return
                    }
                }
            }
        } catch (g) {}
        DataList.buildLeftPanel(d)
    },
    getMyTVContent: function(a) {
        var c = 16;
        switch (a) {
            case "program-recording":
            case "pending-recordings":
                c = 17;
                break;
            case "watch-later":
                c = 18;
                break
        }
        var b = API.call({
            url: API.base_url + "my-tv/" + a,
            data: {
                extended: true
            },
            errorWrapper: true,
            errorCode: c,
            emptyResponseAllowed: true,
            success: function(d) {
                if (View.actualPageIs(Mytv)) {
                    Mytv.buildLeftPanel(DataStore.parseAndStore(d))
                }
            }
        })
    },
    getMyTVProgramDetails: function(c, b) {
        if (!c) {
            return
        }
        var a = API.call({
            url: API.base_url + "details/program",
            data: {
                id: c
            },
            errorWrapper: true,
            errorCode: -1,
            emptyResponseAllowed: false,
            success: function(f) {
                var d = DataStore.parseAndStore(f);
                d.id = c;
                if (View.actualPageIs(Mytv) && !b) {
                    Mytv.buildMiddlePanel(d)
                } else {
                    if (View.actualPageIs(DataList) && b === true) {
                        DataList.buildMiddlePanel(d)
                    }
                }
            }
        })
    },
    addMyTVItem: function(c, i, g, b) {
        var a;
        var h = 11;
        var f = {
            id: i
        };
        switch (c) {
            case "recording":
                a = "my-tv/add-recording";
                if (b === false) {
                    f.single = "1"
                }
                if (b === false || typeof b == "undefined") {
                    h = 50
                }
                break;
            case "program-recording":
                a = "my-tv/add-program-recording";
                f.channel = g;
                h = 50;
                break;
            case "watch-later":
                a = "my-tv/add-watch-later";
                h = 12;
                break;
            default:
                return
        }
        var d = API.call({
            url: API.base_url + a,
            data: f,
            errorWrapper: true,
            errorCode: h,
            emptyResponseAllowed: true,
            success: function(j) {
                if (c === "watch-later") {
                    PopMsg.show("info", 41)
                } else {
                    if (j && j.data && j.data.program) {
                        var k = j.data.program;
                        if (parseInt(k.season) > 0 && parseInt(k.episode) <= 0 && parseInt(k.episodePartial) <= 0) {
                            PopMsg.show("info", 49);
                            return
                        }
                    }
                    PopMsg.show("info", 42)
                }
            }
        })
    },
    deleteMyTVItem: function(b, f) {
        var d = 36;
        var a = "my-tv/remove-recording";
        switch (b) {
            case "watch-later":
                a = "my-tv/remove-watch-later";
                d = 38;
                break;
            case "pending-recordings":
                a = "my-tv/cancel-recording";
                d = 37;
                break;
            case "you-missed-it":
                return false
        }
        var c = API.call({
            url: API.base_url + a,
            data: {
                id: f
            },
            errorWrapper: true,
            errorCode: d,
            emptyResponseAllowed: true,
            success: function(h, g, i) {
                View.changeView(Mytv)
            }
        });
        return true
    },
    voteProgram: function(d, b) {
        var a = DataStore.get(Type.Program, d);
        if (a) {
            a.userVote = b
        }
        var c = API.call({
            url: API.base_url + "vote",
            data: {
                id: d,
                v: b
            },
            errorWrapper: true,
            errorCode: 9,
            emptyResponseAllowed: true,
            success: function() {
                PopUp.deInitView()
            }
        })
    },
    getEPGContent: function(b, d) {
        var c = new Date();
        if (b != 0) {
            c.setDate(c.getDate() + b)
        }
        c.setHours(0, 0, 0, 0);
        var f = c.getTime() / 1000;
        var a = d.join(",");
        var h = "86400";
        var g = API.call({
            url: API.base_url + "guide",
            data: {
                start: f,
                duration: h,
                ids: a
            },
            errorWrapper: true,
            errorCode: 8,
            emptyResponseAllowed: false,
            cached: 2,
            success: function(k, i, l) {
                if (k.data.channel) {
                    var j = DataStore.parseAndStore(k.data.channel);
                    if (View.actualPageIs(EPG)) {
                        EPG.buildGridContent(j, c)
                    }
                } else {
                    throw new API.Exception(API.Exception.NO_CONTENT)
                }
            }
        })
    },
    sendEVT: function(h, f, g, c, d) {
        if (g > 100000000 || c > 100000000) {
            return
        }
        var b = {
            pbid: h,
            asset: f,
            sec: g
        };
        if (d === true) {
            b.status = 2
        }
        if (arguments.length > 3 && parseInt(c) > 0) {
            b.played = c
        } else {
            return
        }
        var a = API.call({
            url: API.base_url + "evt/pb",
            data: b,
            hideLoader: true,
            noLogging: true,
            errorWrapper: false,
            errorCode: -1,
            emptyResponseAllowed: true,
            success: function(j, i, k) {
                if (j && j.data) {
                    if (parseInt(j.data) > -10) {
                        EVT.initStopTimer(j.data)
                    } else {
                        EVT.stopPlayer()
                    }
                }
            }
        })
    },
    getDeviceId: function() {
        try {
            if (Main.deviceId === null || Main.deviceId === "" || Main.deviceId === "FOO") {
                if (typeof TVA_Widevine != "undefined") {
                    Main.deviceId = TVA_Widevine.getESN()
                }
            }
        } catch (a) {}
    },
    doLogin: function(b, d, c) {
        API.getDeviceId();
        var a = API.getInfoTxt();
        var f = API.call({
            url: API.base_url + "auth/device-login",
            type: "post",
            data: {
                deviceId: Main.deviceId,
                deviceType: TVA.OTT.DEVICETYPE,
                year: TVA.year,
                u: b,
                p: d,
                info: a
            },
            errorWrapper: true,
            errorCode: 29,
            emptyResponseAllowed: true,
            hideLoader: false,
            loaderIndex: $("#messages-frame").css("zIndex"),
            success: function(h, g, i) {
                API.authSuccess(h, g, i, c)
            }
        })
    },
    registerAndLogin: function(c, f, b, d) {
        API.getDeviceId();
        var a = API.getInfoTxt();
        var g = API.call({
            url: API.base_url + "auth/register",
            type: "post",
            data: {
                deviceId: Main.deviceId,
                deviceType: TVA.OTT.DEVICETYPE,
                year: TVA.year,
                u: c,
                p: f,
                mail: b,
                info: a
            },
            errorWrapper: true,
            errorCode: 29,
            hideLoader: false,
            loaderIndex: $("#messages-frame").css("zIndex"),
            emptyResponseAllowed: true,
            success: function(j, h, k) {
                API.authSuccess(j, h, k, d);
                var i = DataStore.getFromObject(j, "data_message", "");
                if (i != "") {
                    setTimeout(function() {
                        View.loaderElement.css("zIndex", View.loaderElement.attr("zidx"));
                        PopUp.showMe("info", false, i)
                    }, 1000)
                }
            }
        })
    },
    sendPlayResult: function(b) {
        var a = API.call({
            data: b,
            url: API.base_url + "play/result",
            errorWrapper: false,
            errorCode: -1,
            emptyResponseAllowed: true,
            success: function() {}
        })
    }
};
API.Exception = function(b, a) {
    this.message = b || "";
    this.txt = a || "";
    this.toString = function() {
        var c = this.message;
        try {
            c += (this.txt ? ": " + this.txt : "")
        } catch (d) {}
        return c
    }
};
API.Exception.NOT_ENOUGH_ARGS = "NOT_ENOUGH_ARGS";
API.Exception.EMPTY_RESPONSE = "EMPTY_RESPONSE";
API.Exception.API_ERROR = "API_ERROR";
API.Exception.URL_NOT_FOUND = "URL_NOT_FOUND";
API.Exception.NO_CONTENT = "NO_CONTENT";
var Type = {
    Featured: "Featured",
    Related: "Related",
    Recommended: "Recommended",
    MostViewed: "MostViewed",
    HighestRated: "HighestRated",
    SimilarProgram: "SimilarProgram",
    Content: "Content",
    Promo: "Promo",
    Event: "Event",
    Channel: "Channel",
    Program: "Program",
    Asset: "Asset",
    Master: "Master",
    Country: "Country",
    Language: "Language",
    Cast: "Cast",
    Recording: "Recording",
    WatchLater: "WatchLater",
    Schedule: "Schedule"
};
var TypeFeatured = {
    iotype: "Featured",
    event: null,
    program: null,
    asset: null
};
var TypeRelated = {
    iotype: "Related",
    event: null,
    program: null,
    asset: null
};
var TypeRecommended = {
    iotype: "Recommended",
    event: null,
    program: null,
    asset: null
};
var TypeMostViewed = {
    iotype: "MostViewed",
    event: null,
    program: null,
    asset: null
};
var TypeHighestRated = {
    iotype: "HighestRated",
    event: null,
    program: null,
    asset: null
};
var TypeSimilarProgram = {
    iotype: "SimilarProgram",
    event: null,
    program: null,
    asset: null
};
var TypeContent = {
    iotype: "Content",
    event: null,
    program: null,
    asset: null
};
var TypePromo = {
    iotype: "Promo",
    event: null,
    program: null,
    backgroundUrl: null
};
var TypeEvent = {
    iotype: "Event",
    id: null,
    program: null,
    asset: null,
    startTime: "2012-01-01T12:00:00+0000",
    endTime: "2012-01-01T13:00:00+0000",
    channel: null,
    title: null,
    type: null,
    genre: null,
    dual: null,
    subtitle: null,
    deafSubtitle: null,
    originalVersion: null,
    blindCommentary: null,
    live: null,
    repeated: null,
    firstShowing: null,
    lastShowing: null,
    hd: null,
    prerecorded: null,
    stereo: null
};
var TypeChannel = {
    iotype: "Channel",
    id: null,
    name: "",
    abrev: "",
    logoUrl: null,
    subscribed: null,
    free: null,
    liveAsset: null,
    events: null
};
var TypeProgram = {
    iotype: "Program",
    id: null,
    event: null,
    asset: null,
    title: "",
    episodeTitle: "",
    season: 0,
    episode: 0,
    episodePartial: 0,
    type: "",
    genre: "",
    parentalRating: 0,
    artisticReview: 0,
    comercialReview: 0,
    usersReview: 0,
    userVote: 0,
    productionYear: 0,
    productionCountry: null,
    language: null,
    synopsis: "",
    shortestSynopsis: "",
    thumbnailUrl: null,
    promoBgUrl: null,
    backgroundUrl: null,
    listBgUrl: null,
    coverUrl: null,
    cast: null,
    hashTag: null,
    trailerUrl: null,
    isMaster: null,
    master: null
};
var TypeAsset = {
    iotype: "Asset",
    id: null,
    keyName: null,
    duration: null,
    program: null,
    channel: null,
    url: null,
    drm: {
        type: "widevine",
        portalId: null,
        signonUrl: null,
        logUrl: null,
        emmUrl: null
    },
    pbId: null,
    adsvcUrl: null
};
var TypeMaster = {
    iotype: "Program",
    id: null,
    title: ""
};
var TypeCountry = {
    iotype: "Country",
    id: null,
    name: ""
};
var TypeLanguage = {
    iotype: "Language",
    id: null,
    name: ""
};
var TypeCast = {
    iotype: "Cast",
    id: null,
    name: "",
    surname: "",
    fullName: "",
    role: null
};
var TypeRecording = {
    iotype: "Recording",
    id: null,
    schedule: null,
    event: null,
    program: null,
    asset: null
};
var TypeWatchLater = {
    iotype: "WatchLater",
    id: null,
    asset: null
};
var TypeSchedule = {
    iotype: "Schedule",
    id: null
};
var APICache = {
    cache: {},
    cacheTimeout: 30 * 1000,
    cleanData: function() {
        try {
            var a = Utils.now();
            for (var b in APICache.cache) {
                if (APICache.cache.hasOwnProperty(b)) {
                    if (a - APICache.cache[b].now > APICache.cacheTimeout * APICache.cache[b].cached) {
                        delete APICache.cache[b]
                    }
                }
            }
        } catch (c) {}
    },
    getKey: function(b) {
        if (b) {
            var a = b.url + ":" + JSON.stringify(b.data);
            return a.replace(/([^A-Za-z0-9\:])+/gi, "")
        }
        return ""
    },
    getData: function(c) {
        try {
            var b = APICache.getKey(c);
            if (APICache.cache[b]) {
                var a = Utils.now();
                if (a - APICache.cache[b].now > APICache.cacheTimeout * APICache.cache[b].cached) {
                    delete APICache.cache[b];
                    return null
                }
                return APICache.cache[b].data
            }
        } catch (d) {}
        return null
    },
    saveData: function(b, c) {
        try {
            var a = APICache.getKey(b);
            if (APICache.cache[a]) {
                return false
            } else {
                if (b.cached < 1) {
                    b.cached = 1
                } else {
                    if (b.cached > 5) {
                        b.cached = 5
                    }
                }
                APICache.cache[a] = {
                    now: Utils.now(),
                    data: c,
                    cached: b.cached
                }
            }
            return true
        } catch (d) {}
        return false
    }
};
var DataStore = {
    Event: null,
    Channel: null,
    Program: null,
    Asset: null,
    Master: null,
    Country: null,
    Language: null,
    Cast: null,
    Recording: null,
    Content: null,
    WatchLater: null,
    LiveChannels: null,
    canPlay: function(c) {
        var b = false;
        for (var a in TVA.OTT.DRM) {
            if (TVA.OTT.DRM.hasOwnProperty(a)) {
                if (c.drms.indexOf(TVA.OTT.DRM[a]) >= 0) {
                    b = true
                }
            }
        }
        return b
    },
    parseAndStore: function(b) {
        if (!b) {
            return false
        }
        if (b.drms && !DataStore.canPlay(b)) {
            b.id = null
        }
        if (b.data) {
            return DataStore.parseAndStore(b.data)
        }
        var p = [];
        if (b instanceof Array) {
            for (var g in b) {
                var h = DataStore.parseAndStore(b[g]);
                if (h.iotype) {
                    var k = DataStore.getDummyObj(h.iotype);
                    h = jQuery.extend(k, h)
                }
                p.push(h)
            }
            return p
        } else {
            var o = {};
            for (var g in b) {
                if (b[g]) {
                    if (typeof b[g] === "object" && b[g].id) {
                        var m = DataStore.parseAndStore(b[g]);
                        o[g] = b[g].id
                    } else {
                        if (b[g] instanceof Array) {
                            p = [];
                            for (var d in b[g]) {
                                if (b[g][d].id) {
                                    var m = DataStore.parseAndStore(b[g][d]);
                                    p.push(b[g][d].id)
                                } else {
                                    if (b[g][d]["iotype"] == "Content") {
                                        var n = {};
                                        if (b[g][d]["event"]) {
                                            n.event = DataStore.parseAndStore(b[g][d]["event"])
                                        }
                                        if (b[g][d]["program"]) {
                                            n.program = DataStore.parseAndStore(b[g][d]["program"])
                                        }
                                        p.push(n)
                                    }
                                }
                            }
                            o[g] = p
                        } else {
                            if (g === "startTime" || g === "endTime") {
                                o[g] = Utils.getDateObj(b[g])
                            } else {
                                o[g] = b[g]
                            }
                        }
                    }
                } else {
                    if (b[g] === false || b[g] === 0) {
                        o[g] = b[g]
                    }
                }
            }
            if (o && o.id) {
                DataStore.store(o)
            }
            try {
                var c = null;
                var f = null;
                var a = null;
                if (o.asset) {
                    c = DataStore.get(Type.Asset, o.asset)
                } else {
                    if (o.liveAsset) {
                        c = DataStore.get(Type.Asset, o.liveAsset)
                    }
                }
                if (o.program) {
                    f = DataStore.get(Type.Program, o.program)
                } else {
                    if (c && c.program) {
                        f = DataStore.get(Type.Program, c.program)
                    }
                }
                if (o.event) {
                    a = DataStore.get(Type.Event, o.event)
                }
                if (c && f) {
                    f.asset = o.asset
                }
                if (c && a) {
                    a.asset = o.asset
                }
                if (f && a) {
                    f.event = a.id;
                    a.program = f.id
                }
            } catch (l) {}
            return o
        }
    },
    getFromObject: function(obj, path, defaultReturn) {
        defaultReturn = defaultReturn || "";
        try {
            var pathArr = path.split("_");
            var varStr = "obj";
            for (var x = 0; x < pathArr.length; x++) {
                var tmp = pathArr[x];
                if (typeof tmp === "number") {
                    varStr += "[" + tmp + "]"
                } else {
                    varStr += "['" + tmp + "']"
                }
            }
            return eval(varStr)
        } catch (e) {
            return defaultReturn
        }
    },
    getType: function(a) {
        try {
            if (a.indexOf("Schedule") === 0) {
                return "Schedule"
            }
        } catch (b) {}
        return a
    },
    store: function(c) {
        try {
            var a = DataStore.getType(c.iotype);
            var f = c.id;
            if (!DataStore[a]) {
                DataStore[a] = {}
            }
            if (DataStore[a][f]) {
                jQuery.extend(DataStore[a][f], c)
            } else {
                var d = DataStore.getDummyObj(a);
                DataStore[a][f] = jQuery.extend(d, c)
            }
            return f
        } catch (b) {
            return false
        }
    },
    get: function(a, c) {
        a = DataStore.getType(a);
        try {
            return DataStore[a][c] || DataStore.getDummyObj(a)
        } catch (b) {
            return DataStore.getDummyObj(a)
        }
    },
    remove: function(a, c) {
        a = DataStore.getType(a);
        try {
            if (DataStore[a][c]) {
                return delete DataStore[a][c]
            }
            return false
        } catch (b) {
            return false
        }
    },
    cleanRefs: function() {
        try {
            var c = Type.Program;
            var a = DataStore[c];
            for (var b in a) {
                if (a.hasOwnProperty(b)) {
                    var e = a[b];
                    if (e.master) {
                        e.master = null
                    }
                    if (e.parent) {
                        e.parent = null
                    }
                }
            }
        } catch (d) {}
    },
    getDummyObj: function(type) {
        type = DataStore.getType(type);
        try {
            var objName = eval("Type" + type);
            return jQuery.extend({}, objName)
        } catch (e) {
            return false
        }
    }
};
var Messenger = {
    BUF_LEN: 60,
    STR_LEN: 160,
    notifyPopup: function(a, b, c, d) {
        if (a == "error") {
            if (typeof c === "undefined") {
                c = "-"
            }
            switch (b) {
                case 51:
                case 47:
                case 34:
                    this._sendInfo("notifyPopup", a, {
                        stat: d + " [" + c + "]",
                        nr: b
                    });
                    break
            }
        }
    },
    videoPlayerStoppedDisabled: false,
    videoPlayerStopped: function() {
        try {
            var b = VideoPlayer.bufferEmptyMessages.length;
            if (b > 0) {
                var a = b > Messenger.BUF_LEN ? Messenger.BUF_LEN : b;
                var d = {
                    len: b,
                    res: VideoPlayer.bufferEmptyMessages.slice(0, a)
                };
                this._sendInfo("videoPlayerStopped", "buffering", JSON.stringify(d));
                VideoPlayer.bufferEmptyMessages = []
            }
        } catch (c) {}
        if (this.videoPlayerStoppedDisabled == true) {
            this.videoPlayerStoppedDisabled = false;
            return
        }
        this._sendInfo("videoPlayerStopped", "result", "STOP")
    },
    videoPlayerCanceled: function() {
        this._sendInfo("videoPlayerCanceled", "result", "CANCELED")
    },
    balancedUrl: function(a, c) {
        if (a) {
            var d = a;
            try {
                if (SmartPlugin) {
                    SmartPlugin.urlResource = a
                }
            } catch (b) {}
            this._sendInfo("balancedUrl", "url", d)
        }
    },
    videoPlayerResponseReceived: function(a) {
        try {
            if (typeof a === "string" && a.length > 0) {
                if (a.length > Messenger.STR_LEN) {
                    a = a.substring(0, Messenger.STR_LEN) + "..."
                }
                this._sendInfo("videoPlayerResponseReceived", "result", "RESPONSE_RECEIVED:" + a)
            } else {
                this._sendInfo("videoPlayerResponseReceived", "result", "RESPONSE_RECEIVED")
            }
        } catch (b) {}
    },
    videoPlayerConnecting: function() {
        this._sendInfo("videoPlayerConnecting", "result", "CONNECTING")
    },
    _sendInfo: function(c, b, a, d) {
        if (typeof a === "object") {
            a = JSON.stringify(a)
        }
        API.sendPlayResult({
            k: b,
            v: a,
            id: this._getAssetId(),
            pbid: this._getPbId(d),
            fn: c
        })
    },
    _getAssetId: function() {
        var a = "";
        try {
            a = VideoPlayer.details.assetId
        } catch (b) {}
        return a
    },
    _getPbId: function() {
        var a = "";
        try {
            a = VideoPlayer.lastPlayerResponseVideo.pbId
        } catch (b) {}
        return a
    }
};
var Commons = {
    lastTextScroll: null
};
Commons.scroll = function(j, c, f) {
    var k = 0;
    var i = 250;
    var e = false;
    if (c.movement != "top") {
        k = $(c.list + " " + c.listItem).width()
    } else {
        k = $(c.list + " " + c.listItem).height()
    }
    var g = parseInt($(c.list).css(c.movement));
    var h = 0;
    if (j < 0) {
        h = 0;
        if (g + k <= 0) {
            h = g + (k * f)
        } else {
            h = c.offset
        }
    } else {
        var b = $(c.list + " " + c.listItem).length;
        var d = (c.displayItems - 1);
        var a = (b - d) * k;
        h = Math.abs(g - (k * f));
        if (h < a) {
            h = g - (k * f)
        } else {
            h = k - a
        }
        if (c.movement == "top" && h > 0) {
            return
        }
    }
    if (h > 0) {
        h = 0
    }
    if (e) {
        if (c.movement == "top") {
            $(c.itemMove).animate({
                top: h
            }, i, function() {
                this.top = h
            })
        } else {
            $(c.itemMove).animate({
                left: h
            }, i, function() {})
        }
    } else {
        $(c.itemMove).css(c.movement, h)
    }
};
Commons.scrollIni = function(a) {
    $(a.list).css(a.movement, a.offset)
};
Commons.scrollEnd = function(a) {
    var b = 0;
    if (a.movement != "top") {
        b = $(a.list + " " + a.listItem).width()
    } else {
        b = $(a.list + " " + a.listItem).height()
    }
    var c = ($(a.list + " " + a.listItem).length - (a.displayItems)) * b;
    if (c >= 0) {
        $(a.list).css(a.movement, -(a.offset + c))
    }
};
Commons._textScrollById = function(k, a) {
    var d = $("#" + a);
    var f = d.height();
    var b = parseInt(d.css("top"));
    var l = $("#datasheet-description-container").height();
    var c = l - f;
    var e = c / l;
    var j = 0;
    var g = null;
    if (Math.abs(b) < Math.abs(c)) {
        if (k < 0 && f > l) {
            g = (b + ((Math.abs(c) / Math.abs(e)) * k));
            j = l - (f + g);
            d.css("top", j > 0 ? g + j : g);
            if (j > 0) {
                g = null
            }
        } else {
            if (b < 0) {
                g = (b + ((Math.abs(c) / Math.abs(e)) * k));
                j = l - (f + g);
                d.css("top", g > 0 ? 0 : g);
                if (g <= 0) {
                    g = null
                }
            } else {
                g = 0
            }
        }
    } else {
        if (k > 0) {
            if (b < 0) {
                if (Commons.lastTextScroll != 0) {
                    g = (b + (Commons.lastTextScroll))
                } else {
                    g = (b + ((Math.abs(c) / Math.abs(e)) * k))
                }
                d.css("top", g > 0 ? 0 : g);
                $("#prev-datasheet-description").removeClass("active");
                $("#next-datasheet-description").addClass("active");
                if (g <= 0) {
                    g = null
                }
            } else {
                g = 0
            }
        } else {
            g = 0
        }
    }
    var i = false;
    if (k > 0) {
        var h = parseInt(d.css("top"));
        i = (g !== null && g <= 0)
    } else {
        if (k < 0) {
            j = l - (f + parseInt(d.css("top")));
            i = (j >= 0 && g !== null)
        }
    }
    return i
};
Commons.textScroll = function(a) {
    var c = Commons._textScrollById(a, "datasheet-description");
    var b = Commons._textScrollById(a, "datasheet-cast");
    return c && b
};
Commons.scrollBySize = function(b, a, f, c) {
    var d = ($(a.list + " " + a.listItem).length - (a.displayItems - 1)) * c;
    var e = parseInt($(a.list).css(a.movement));
    if (b < 0) {
        if (e + c <= 0) {
            $(a.itemMove).css(a.movement, e + (c * f))
        } else {
            $(a.itemMove).css(a.movement, a.offset)
        }
    } else {
        if (Math.abs(e - c) < d) {
            $(a.itemMove).css(a.movement, e - (c * f))
        }
    }
};
Commons.setHover = function(d) {
    d = d.replace(/#/g, "");
    if (!d || d.length == 0) {
        return
    }
    var a = $("#" + d);
    if (a.length > 0) {
        var c = View.actualHover;
        try {
            Commons.offHover(c)
        } catch (b) {}
        View.actualHover = d;
        TVA.setHover(d)
    }
};
Commons.offHover = function(a) {
    a = a.replace(/#/g, "");
    if (a && $("#" + a).length > 0) {
        TVA.offHover(a)
    }
};
Commons.setFocus = function(b) {
    b = b.replace(/#/g, "");
    if (b && $("#" + b).length > 0) {
        try {
            Commons.offFocus(View.actualFocus)
        } catch (a) {}
        View.actualFocus = b;
        TVA.setFocus(b)
    }
};
Commons.offFocus = function(a) {
    a = a.replace(/#/g, "");
    if (a && $("#" + a).length > 0) {
        TVA.offFocus(a)
    }
};
Commons.hideVersion = function() {
    $(".bookmark").addClass("hide-this")
};
var Header = {
    actualPage: 0,
    headerPages: 0,
    activePage: 0,
    previousActivePage: -1,
    storeFrontCount: 0,
    storeFrontLoaded: false,
    init: function() {
        Header.actualPage = 0;
        Header.headerPages = 0;
        Header.activePage = 0;
        Header.previousActivePage = -1;
        Header.storeFrontCount = 0;
        Header.storeFrontLoaded = false;
        $(".header-menu-help").html("AYUDA")
    },
    jsonResponse: function(b) {
        if (typeof b === "object" && b !== null && b.data && b.data.length > 0) {
            var a = $(".header-menu-totalfan");
            a.removeClass("hide-this");
            TVA.putInnerHTML(a.get(0), "TOTALSTORE")
        }
        TotalStore.options = b && b.data ? b.data : null
    },
    setFocus: function(a) {
        if (a === true && Header.previousActivePage < 0) {
            try {
                if (View.actualPage == Home) {
                    Header.previousActivePage = 0
                } else {
                    if (View.actualPage == EPG) {
                        Header.previousActivePage = 2
                    } else {
                        if (View.actualPage == Mytv) {
                            Header.previousActivePage = 3
                        } else {
                            if (View.actualPage == TotalStore) {
                                Header.previousActivePage = -1;
                                $(".header-menu").each(function(d) {
                                    if ($(this).hasClass("header-menu-totalfan")) {
                                        Header.previousActivePage = 3
                                    }
                                })
                            } else {
                                if (View.actualPage == Storefront) {
                                    Header.previousActivePage = -1;
                                    $(".header-menu").each(function(d) {
                                        var e = $(this).get(0).getAttribute("data-id");
                                        if (Storefront.mode === e && Header.previousActivePage < 0) {
                                            Header.previousActivePage = d
                                        }
                                    })
                                }
                            }
                        }
                    }
                }
            } catch (c) {}
        }
        Header.checkActive();
        Commons.offFocus(View.actualFocus);
        Commons.offHover(View.actualHover);
        Commons.setFocus("header");
        Commons.setHover("header" + Header.actualPage);
        Header.headerPages = $(".header-list").find("li").length;
        if (View.actualPage === Mytv && $("#left-panel-list").find(".displayed").length === 0) {
            Footer.enableLeft();
            var b = $("#left-controls");
            b.find(".one-button-footer").addClass("disabled");
            b.find(".two-button-footer").addClass("disabled")
        } else {
            Footer.disableLeft()
        }
    },
    checkActive: function() {
        if (Header.previousActivePage >= 0) {
            $(".header-list").find("li").removeClass("active");
            Header.activePage = Header.previousActivePage;
            $("#header" + Header.previousActivePage).addClass("active");
            Header.previousActivePage = -1
        }
    },
    hideMe: function(a) {
        if (a) {
            $("#header").addClass("hide-this")
        } else {
            $("#header").removeClass("hide-this")
        }
    },
    isVisible: function() {
        return !$("#header").hasClass("hide-this")
    },
    removeElement: function(b) {
        var a = $("#header" + b).not(".header-important");
        if (a && a.length) {
            a.addClass("hidden-header-element");
            return true
        }
        return false
    },
    keyHandler: function(a) {
        var c, e = 0;
        var b = $(".header-list");
        var f = null;
        if (Header.headerPages == 0) {
            f = b.find("li");
            Header.headerPages = f.length
        }
        switch (a) {
            case TVA.tvKey.KEY_RIGHT:
                for (e = Header.actualPage + 1; e < Header.headerPages; e++) {
                    c = $("#header" + e);
                    if (c && !c.hasClass("hidden-header-element") && !c.hasClass("hide-this")) {
                        break
                    }
                    c = null
                }
                if (c) {
                    Commons.offHover(View.actualHover);
                    Header.actualPage = e;
                    Commons.setHover("header" + Header.actualPage)
                }
                break;
            case TVA.tvKey.KEY_LEFT:
                for (e = Header.actualPage - 1; e >= 0; e--) {
                    c = $("#header" + e);
                    if (c && !c.hasClass("hidden-header-element") && !c.hasClass("hide-this")) {
                        break
                    }
                    c = null
                }
                if (c) {
                    Commons.offHover(View.actualHover);
                    Header.actualPage = e;
                    Commons.setHover("header" + Header.actualPage)
                }
                break;
            case TVA.tvKey.KEY_DOWN:
                if (TVA.OTT.CLOSE_CHLIST == false && !View.actualPageIs(VideoPlayer) && SidePanel.isVisible()) {
                    SidePanel.setFocus();
                    return
                }
                View.actualPage.setFocus();
                break;
            case TVA.tvKey.KEY_ENTER:
                e = Header.activePage;
                c = Header.actualPage;
                $("#header" + Header.activePage).removeClass("active");
                if (f == null || !f.length) {
                    f = b.find("li")
                }
                f.removeClass("active");
                $("#header" + Header.actualPage).addClass("active");
                Header.activePage = Header.actualPage;
                if (Header.actualPage == 0) {
                    View.changeView(Home)
                } else {
                    if (Header.actualPage == 3) {
                        if (Main.username !== "") {
                            View.changeView(Mytv)
                        } else {
                            Header.activePage = e;
                            Header.actualPage = c;
                            $("#header" + c).removeClass("active");
                            f.removeClass("active");
                            $("#header" + e).addClass("active");
                            PopMsg.show("info", 35)
                        }
                    } else {
                        if (Header.actualPage == 2) {
                            View.changeView(EPG)
                        } else {
                            if (Header.actualPage == 1) {
                                if (TVA.OTT.CLOSE_CHLIST == true) {
                                    Header.previousActivePage = e
                                }
                                API.getChannels("live")
                            } else {
                                if ($("#header" + Header.actualPage).hasClass("header-menu-totalfan")) {
                                    View.changeView(TotalStore)
                                } else {
                                    if ($("#header" + Header.actualPage).hasClass("header-menu-last")) {
                                        API.startPairing()
                                    } else {
                                        if ($("#header" + Header.actualPage).hasClass("header-menu-help")) {
                                            Header.previousActivePage = e;
                                            PopUp.showTutorial(true)
                                        } else {
                                            if ((Header.actualPage >= 4) && (Header.actualPage <= (4 + Header.storeFrontCount))) {
                                                var d = document.getElementById("header" + Header.actualPage);
                                                Storefront.mode = d.getAttribute("data-id");
                                                Storefront.pageIdx = 4 + parseInt(d.getAttribute("data-page-idx"));
                                                View.changeView(Storefront)
                                            } else {
                                                if (Header.actualPage == (Header.headerPages - 1)) {
                                                    API.startPairing()
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                break;
            case TVA.tvKey.KEY_PLAY:
            case TVA.tvKey.KEY_PAUSE:
            case TVA.tvKey.KEY_RW:
            case TVA.tvKey.KEY_FF:
            case TVA.tvKey.KEY_FAST_FW:
            case TVA.tvKey.KEY_FAST_RW:
            case TVA.tvKey.KEY_STOP:
            case TVA.tvKey.KEY_INFO:
                return true;
                break
        }
        return false
    },
    setPage: function(b, a) {
        Header.actualPage = a;
        Commons.setHover(b)
    },
    handleSpecialKeys: function(c) {
        try {
            if (TVA.tvKey && TVA.tvKey.hasOwnProperty("KEY_CHLIST") && TVA.tvKey.KEY_CHLIST && c === TVA.tvKey.KEY_CHLIST && Main.username != "" && View.actualPageIs(PopUp) == false) {
                if (View.actualFocus !== "side-panel-container" && View.actualFocus !== "side-panel-container-video") {
                    API.getChannels("live")
                } else {
                    SidePanel.hideMe(true);
                    View.actualPage.setFocus()
                }
                return true
            }
            if (TVA.tvKey && TVA.tvKey.hasOwnProperty("KEY_GUIDE") && TVA.tvKey.KEY_GUIDE && c === TVA.tvKey.KEY_GUIDE && View.actualPageIs(PopUp) == false) {
                var a = false;
                if (View.actualFocus === "side-panel-container" || View.actualFocus === "side-panel-container-video") {
                    SidePanel.hideMe(true);
                    a = true
                }
                if (View.actualPageIs(EPG) == false) {
                    Header.actualPage = 2;
                    Header.keyHandler(TVA.tvKey.KEY_ENTER)
                } else {
                    if (a == true) {
                        View.actualPage.setFocus()
                    }
                }
                return true
            }
            if (TVA.tvKey && (c === TVA.tvKey.KEY_CH_UP || c === TVA.tvKey.KEY_CH_DOWN) && View.actualPageIs(VideoPlayer) == false && View.actualPageIs(PopUp) == false) {
                if (View.actualFocus !== "side-panel-container" && View.actualFocus !== "side-panel-container-video") {
                    API.getChannels("live");
                    return true
                } else {
                    return (c === TVA.tvKey.KEY_CH_UP) ? TVA.tvKey.KEY_UP : TVA.tvKey.KEY_DOWN
                }
            }
        } catch (b) {}
        return false
    }
};
var Footer = {
    element: {
        "logged-user": null,
        "left-controls": null,
        "center-controls": null,
        "right-controls": null
    },
    leftMethods: {},
    leftDisabled: false,
    centerMethods: {},
    centerDisabled: false,
    rightMethods: {},
    rightDisabled: false,
    init: function() {
        Footer.element["logged-user"] = $("#logged-user");
        Footer.element["left-controls"] = $("#left-controls");
        Footer.element["center-controls"] = $("#center-controls");
        Footer.element["right-controls"] = $("#right-controls");
        try {
            Footer.setUser("");
            Footer.clean()
        } catch (a) {}
    },
    clean: function() {
        try {
            TVA.putInnerHTML(Footer.element["left-controls"].get(0), "");
            TVA.putInnerHTML(Footer.element["center-controls"].get(0), "")
        } catch (a) {}
    },
    setUser: function(a) {
        TVA.putInnerHTML(Footer.element["logged-user"].get(0), a)
    },
    setLeft: function(a) {
        var h = a.slice(0);
        var g = "";
        if (TVA.zoomMargins != null && View.actualPage == Home) {
            var e, d;
            g = "yellow-button-footer";
            var f = TVA.tvKey.KEY_YELLOW;
            if (TVA.device == "ps3") {
                g = "green-button-footer";
                f = TVA.tvKey.KEY_GREEN
            }
            e = {
                text: "Zoom +",
                className: g,
                keycode: f,
                method: function() {
                    Utils.setZoom(+1);
                    Footer.checkButtons(false);
                    return false
                }
            };
            g = "blue-button-footer";
            f = TVA.tvKey.KEY_BLUE;
            if (TVA.device == "ps3") {
                g = "red-button-footer";
                f = TVA.tvKey.KEY_RED
            }
            d = {
                text: "Zoom -",
                className: g,
                keycode: f,
                method: function() {
                    Utils.setZoom(-1);
                    Footer.checkButtons(false);
                    return false
                }
            };
            if (TVA.device == "ps3") {
                h.push(d);
                h.push(e)
            } else {
                h.push(e);
                h.push(d)
            }
        }
        var c = "";
        Footer.leftMethods = {};
        for (var b = 0; b < h.length; b++) {
            var j = h[b];
            g = j.className;
            if (j.disabled) {
                g += " disabled"
            }
            c += '<li id="leftFooterButton' + b + '" class="leftFooterButton-' + j.keycode + " " + g + '" onmouseover="Commons.setHover(this.id);" onmouseout="Commons.offHover(this.id);" onclick="Footer.keyHandler(' + j.keycode + ');">' + j.text + "</li>";
            Footer.leftMethods[j.keycode] = j.method
        }
        TVA.putInnerHTML(Footer.element["left-controls"].get(0), c);
        if (TVA.zoomMargins != null && View.actualPage == Home) {
            Footer.checkButtons(false)
        }
    },
    setCenter: function(e) {
        var a = e.slice(0);
        var c = "";
        Footer.centerMethods = {};
        for (var b = 0; b < a.length; b++) {
            var f = a[b];
            var d = f.className;
            if (f.disabled) {
                d += " disabled"
            }
            c += '<li id="centerFooterButton' + b + '" class="centerFooterButton-' + f.keycode + " " + d + '" onmouseover="Commons.setHover(this.id);" onmouseout="Commons.offHover(this.id);" onclick="Footer.keyHandler(' + f.keycode + ');">' + f.text + "</li>";
            Footer.centerMethods[f.keycode] = f.method
        }
        TVA.putInnerHTML(Footer.element["center-controls"].get(0), c)
    },
    setRight: function(d) {
        var a = d.slice(0);
        var c = "";
        Footer.rightMethods = {};
        for (var b = 0; b < a.length; b++) {
            var e = a[b];
            c += '<li id="rightFooterButton' + b + '" class="rightFooterButton-' + e.keycode + " " + e.className + '" onmouseover="Commons.setHover(this.id);" onmouseout="Commons.offHover(this.id);" onclick="Footer.keyHandler(' + e.keycode + ');">' + e.text + "</li>";
            Footer.rightMethods[e.keycode] = e.method
        }
        TVA.putInnerHTML(Footer.element["right-controls"].get(0), c)
    },
    enableLeft: function() {
        if (Footer.element["left-controls"]) {
            Footer.element["left-controls"].removeClass("disabled")
        }
        Footer.leftDisabled = false
    },
    disableLeft: function() {
        if (Footer.element["left-controls"]) {
            Footer.element["left-controls"].addClass("disabled")
        }
        Footer.leftDisabled = true;
        if (TVA.zoomMargins != null && View.actualPage == Home) {
            Footer.checkButtons(false)
        }
    },
    checkButtons: function(d) {
        if (TVA.zoomMargins === null || (View.tempPage !== Home && View.actualPage !== Home)) {
            return
        }
        var a = ".yellow-button-footer";
        var b = ".blue-button-footer";
        if (TVA.device == "ps3") {
            a = ".green-button-footer";
            b = ".red-button-footer"
        }
        if (d === true) {
            $(a).removeClass("notdisabled").addClass("disabled");
            $(b).removeClass("notdisabled").addClass("disabled");
            return
        }
        var c = Utils.getZoom();
        if (TVA.zoomMargins.min == c) {
            $(a).addClass("notdisabled").removeClass("disabled");
            $(b).removeClass("notdisabled").addClass("disabled")
        } else {
            if (TVA.zoomMargins.max == c) {
                $(a).removeClass("notdisabled").addClass("disabled");
                $(b).addClass("notdisabled").removeClass("disabled")
            } else {
                $(a).addClass("notdisabled").removeClass("disabled");
                $(b).addClass("notdisabled").removeClass("disabled")
            }
        }
    },
    enableCenter: function() {
        Footer.element["center-controls"].removeClass("disabled");
        Footer.centerDisabled = false
    },
    disableCenter: function() {
        Footer.element["center-controls"].addClass("disabled");
        Footer.centerDisabled = true
    },
    disableRight: function() {
        Footer.element["right-controls"].addClass("disabled");
        Footer.rightDisabled = true
    },
    enableRight: function() {
        Footer.element["right-controls"].removeClass("disabled");
        Footer.rightDisabled = false
    },
    keyHandler: function(b, d) {
        if (View.actualFocus === "footer" && d !== true) {
            return Footer.footerKeyHandler(b)
        }
        var a = b;
        if (Main.keyHistoryMatches(Main.SHORTCUT_SHOW_INFOBAR_CLOCK) == true) {
            a = TVA.tvKey.FN_12
        }
        switch (a) {
            case TVA.tvKey.KEY_DOWN:
            case TVA.tvKey.KEY_UP:
            case TVA.tvKey.KEY_RIGHT:
            case TVA.tvKey.KEY_LEFT:
                return true
        }
        if (a == TVA.tvKey.KEY_PLAY && View.actualPage != VideoPlayer && (d == true || View.actualPage != EPG)) {
            API.getChannels("direct");
            return false
        } else {
            if (!Footer.leftDisabled && Footer.leftMethods.hasOwnProperty(a) && !$(".leftFooterButton-" + a).hasClass("disabled")) {
                return Footer.leftMethods[a]()
            } else {
                if (TVA.zoomMargins != null && Footer.leftDisabled && View.actualPage == Home && ((TVA.device != "ps3" && (a == TVA.tvKey.KEY_YELLOW || a == TVA.tvKey.KEY_BLUE)) || (TVA.device == "ps3" && (a == TVA.tvKey.KEY_GREEN || a == TVA.tvKey.KEY_RED))) && Footer.leftMethods.hasOwnProperty(a) && !$(".leftFooterButton-" + a).hasClass("disabled")) {
                    return Footer.leftMethods[a]()
                } else {
                    if (!Footer.centerDisabled && Footer.centerMethods.hasOwnProperty(a) && !$(".centerFooterButton-" + a).hasClass("disabled")) {
                        return Footer.centerMethods[a]()
                    } else {
                        if (Footer.rightMethods.hasOwnProperty(a) && !$(".rightFooterButton-" + a).hasClass("disabled")) {
                            return Footer.rightMethods[a]()
                        }
                    }
                }
            }
        }
        if (a == TVA.tvKey.FN_12) {
            var c = totalChannelStorage.getItem("clock");
            if (c == "1") {
                c = "0"
            } else {
                c = "1"
            }
            totalChannelStorage.setItem("clock", c);
            View.showClock();
            return false
        }
        return true
    },
    lastFocus: null,
    lastHover: null,
    footerKeyHandler: function(a) {
        switch (a) {
            case TVA.tvKey.KEY_UP:
                Commons.setFocus(Footer.lastFocus);
                Commons.setHover(Footer.lastHover);
                return false;
            case TVA.tvKey.KEY_DOWN:
                if (View.actualPage === VideoPlayer) {
                    VideoControls.hideControls()
                }
                return false;
            case TVA.tvKey.KEY_ENTER:
                Footer.keyHandler(TVA.tvKey.KEY_PLAY, true);
                return false;
            default:
                break
        }
        return true
    },
    setFocus: function(a) {
        if (TVA.GUI.FOCUS_FOOTER == false) {
            Commons.setHover(a ? a : "directo");
            return
        }
        if (View.actualFocus === "footer") {
            return
        }
        Footer.lastFocus = View.actualFocus;
        Footer.lastHover = View.actualHover;
        Commons.offFocus(View.actualFocus);
        Commons.offHover(View.actualHover);
        Commons.setFocus("footer");
        Commons.setHover("directo")
    }
};
var SidePanel = {
    actualItem: 0,
    itemLength: 0,
    visibleItem: 0,
    listBoxDisplay: 0,
    scrollLimit: 0,
    elementNames: {},
    rightFooterWasEnabled: false,
    leftFooterWasEnabled: false,
    timer: null,
    movingFocus: true,
    setFocus: function() {
        Commons.offFocus(View.actualFocus);
        Commons.offHover(View.actualHover);
        Commons.setFocus(SidePanel.elementNames.container);
        Commons.setHover(SidePanel.elementNames.tableItem + SidePanel.actualItem);
        SidePanel.checkScrollIcons();
        SidePanel.hideMe(false)
    },
    isVisible: function() {
        return $("#" + SidePanel.elementNames.container).is(":visible")
    },
    unloadFooter: function() {
        var a = [];
        Footer.disableCenter();
        Footer.setCenter(a);
        if (this.rightFooterWasEnabled) {
            Footer.enableRight()
        }
        if (this.leftFooterWasEnabled) {
            Footer.enableLeft()
        }
        Footer.checkButtons()
    },
    loadFooter: function() {
        this.rightFooterWasEnabled = false;
        this.leftFooterWasEnabled = false;
        if (!Footer.rightDisabled) {
            this.rightFooterWasEnabled = true
        }
        if (!Footer.leftDisabled) {
            this.leftFooterWasEnabled = true;
            Footer.disableLeft()
        }
        var a = [];
        a.push({
            text: "Ver",
            className: "enter-button-footer",
            keycode: false,
            method: false
        });
        Footer.enableCenter();
        Footer.setCenter(a);
        Footer.checkButtons(View.actualPageIs(Home) == false)
    },
    init: function(a) {
        SidePanel.reset();
        if (View.actualPage === VideoPlayer) {
            SidePanel.elementNames = {
                container: "side-panel-container-video",
                overlay: "side-panel-container-overlay-video",
                inner: "side-panel-channels-video",
                table: "side-panel-table-video",
                tableItem: "video-side-option"
            }
        } else {
            SidePanel.elementNames = {
                container: "side-panel-container",
                overlay: "side-panel-container-overlay",
                inner: "side-panel-describe",
                table: "side-panel-table",
                tableItem: "side-option"
            };
            SidePanel.loadFooter()
        }
        SidePanel.listBoxDisplay = a.displayItems;
        SidePanel.scrollLimit = a.scrollLimit - 1;
        $("#" + SidePanel.elementNames.inner).removeClass().addClass(a.classC);
        if (a.modal) {
            $("#" + SidePanel.elementNames.overlay).removeClass("hide-this")
        } else {
            $("#" + SidePanel.elementNames.overlay).addClass("hide-this")
        }
    },
    resetTimeout: function(a) {
        VideoControls.lastButtonPress = 0;
        window.clearTimeout(SidePanel.timer);
        if (a == true && View.actualPage === VideoPlayer && View.actualFocus === "side-panel-container-video") {
            var b = TVA.OTT.HIDE_CONTROLS_TO;
            if (TVA.OTT.DEVICETYPE == TVA.OTT.DEVICETYPE_BRAVIA) {
                b = b + (b / 2)
            }
            SidePanel.timer = window.setTimeout(SidePanel.closePanel, b)
        }
    },
    reset: function() {
        $("#" + SidePanel.elementNames.table).css("top", 0);
        SidePanel.actualItem = 0;
        SidePanel.itemLength = 0;
        SidePanel.visibleItem = 0;
        SidePanel.elementNames = {}
    },
    hideMe: function(a) {
        if (a) {
            $("#" + SidePanel.elementNames.container).addClass("hide-this");
            if (View.actualPageIs(PopUp) == false) {
                Commons.offFocus(View.actualFocus);
                Commons.offHover(View.actualHover)
            }
            SidePanel.unloadFooter();
            SidePanel.resetTimeout(false)
        } else {
            $("#" + SidePanel.elementNames.container).removeClass("hide-this");
            SidePanel.resetTimeout(true)
        }
    },
    scroll: function(a) {
        Commons.scroll(a, {
            list: "#" + SidePanel.elementNames.table,
            listItem: "tr",
            itemMove: "#" + SidePanel.elementNames.table,
            displayItems: SidePanel.listBoxDisplay,
            movement: "top",
            offset: 0
        }, 1)
    },
    checkScrollIcons: function() {
        var d = (SidePanel.actualItem < SidePanel.itemLength - 1);
        var a = (SidePanel.actualItem != 0);
        var c = "side-panel-scroll-up";
        var b = "side-panel-scroll-down";
        if (View.actualPage === VideoPlayer) {
            c += "-video";
            b += "-video"
        }
        if (d) {
            $("#" + b).removeClass("hide-this")
        } else {
            $("#" + b).addClass("hide-this")
        }
        if (a) {
            $("#" + c).removeClass("hide-this")
        } else {
            $("#" + c).addClass("hide-this")
        }
    },
    build: function(a, o) {
        var z = true;
        var g = $("#" + SidePanel.elementNames.table);
        g.addClass("sidepanel-home");
        g.parent().parent().find(".side-panel-info").show();
        var m = "";
        var j = -1;
        var x = "";
        for (var t in a) {
            if (a.hasOwnProperty(t)) {
                var A = a[t];
                if (o && A.id === o.id) {
                    j = parseInt(t)
                }
                var f = "" + A.logoUrl;
                if (f == "" || f == "undefined" || f == "null") {
                    f = "resource/channelicon.png";
                    x = "<img src='" + f + "'>"
                } else {
                    x = "<img src='" + API.image_base_url + f + "'>"
                }
                var u = true;
                try {
                    u = (A.subscribed !== false)
                } catch (d) {
                    u = true
                }
                m += "<tr id='" + SidePanel.elementNames.tableItem + t + "' data-channelId='" + A.id + "' data-assetId='" + A.liveAsset + "' onmouseover='SidePanel.hoverTo(" + t + ",this.id);' onclick='SidePanel.keyHandler(TVA.tvKey.KEY_ENTER);' ><td><div class='channel-logo'>" + x + "</div></td><td class='channel-name " + (u ? "" : "grayed-txt") + "'><div class='sidepanel-chname'>" + A.name + "</div></td>";
                if (z == true) {
                    var r = [];
                    try {
                        r[r.length] = A.pf[0]["program"]["title"];
                        if (A.pf[0]["program"]["episodeTitle"]) {
                            r[r.length] = A.pf[0]["program"]["episodeTitle"]
                        }
                    } catch (y) {}
                    r = r.join(": ");
                    var n = [];
                    try {
                        n[n.length] = A.pf[1]["program"]["title"];
                        if (A.pf[1]["program"]["episodeTitle"]) {
                            n[n.length] = A.pf[1]["program"]["episodeTitle"]
                        }
                    } catch (y) {}
                    n = n.join(": ");
                    m += "<td class='channel-name channel-pf " + (u ? "" : "grayed-txt") + " sidepanel-present'><div class='sidepanel-present-txt'>" + r + "</div></td>";
                    m += "<td class='channel-name channel-pf " + (u ? "" : "grayed-txt") + " sidepanel-following'><div class='sidepanel-following-txt'>" + n + "</div></td>"
                }
                m += "</tr>"
            }
        }
        TVA.putInnerHTML(document.getElementById(SidePanel.elementNames.table), m);
        var p = SidePanel.elementNames.table;
        var l = $("#" + p);
        var b = l.find("tr");
        SidePanel.itemLength = b.length;
        if (j > 0) {
            SidePanel.hideMe(false);
            var h = b.height();
            var q = h * j;
            var w = q;
            var v = l.parent().height();
            var s = l.height() - q;
            if (s < v) {
                q -= (v - s)
            }
            var c = (w - q) / h;
            if (c < SidePanel.scrollLimit) {
                q -= ((SidePanel.scrollLimit - c) * h)
            }
            if (q < 0) {
                q = 0
            }
            SidePanel.actualItem = j;
            SidePanel.visibleItem = (w - q) / h;
            l.css("top", -q)
        }
        SidePanel.setFocus()
    },
    hoverTo: function(b, c) {
        var a = (SidePanel.visibleItem - SidePanel.actualItem);
        SidePanel.actualItem = b;
        SidePanel.visibleItem = SidePanel.actualItem + a;
        Commons.setHover(c);
        SidePanel.checkScrollIcons()
    },
    next: function() {
        var b = SidePanel.actualItem + 1;
        if (b < SidePanel.itemLength) {
            SidePanel.visibleItem = SidePanel.visibleItem + 1;
            if ((SidePanel.visibleItem > SidePanel.scrollLimit) && (SidePanel.actualItem < (SidePanel.itemLength - (SidePanel.listBoxDisplay - SidePanel.scrollLimit)))) {
                SidePanel.visibleItem = SidePanel.scrollLimit;
                SidePanel.scroll(1)
            }
            SidePanel.actualItem = b;
            var a = $("#" + SidePanel.elementNames.table);
            var d = $("#" + SidePanel.elementNames.tableItem + SidePanel.actualItem);
            var c = 0;
            while (a.position().top + d.position().top >= a.parent().height() && c++ < SidePanel.scrollLimit) {
                SidePanel.scroll(1)
            }
            if (SidePanel.movingFocus == true) {
                Commons.setHover(SidePanel.elementNames.tableItem + SidePanel.actualItem);
                SidePanel.checkScrollIcons()
            }
        }
    },
    previous: function(e) {
        var b = SidePanel.actualItem - 1;
        if (b >= 0) {
            SidePanel.visibleItem = SidePanel.visibleItem - 1;
            if ((SidePanel.visibleItem < SidePanel.scrollLimit) && (SidePanel.actualItem > SidePanel.scrollLimit)) {
                SidePanel.visibleItem = SidePanel.scrollLimit;
                SidePanel.scroll(-1)
            }
            SidePanel.actualItem = b;
            var a = $("#" + SidePanel.elementNames.table);
            var d = $("#" + SidePanel.elementNames.tableItem + SidePanel.actualItem);
            var c = 0;
            while (a.position().top + d.position().top < 0 && c++ < SidePanel.scrollLimit) {
                SidePanel.scroll(-1)
            }
            Commons.setHover(SidePanel.elementNames.tableItem + SidePanel.actualItem)
        } else {
            if (!e) {
                if (TVA.OTT.CLOSE_CHLIST == true) {
                    SidePanel.closePanel()
                } else {
                    if (View.actualPageIs(VideoPlayer) && VideoControls.isHidden) {
                        VideoControls.showControls();
                        Header.setFocus()
                    } else {
                        if (Header.isVisible()) {
                            Header.setFocus()
                        }
                    }
                }
            }
        }
        SidePanel.checkScrollIcons()
    },
    closePanel: function() {
        SidePanel.actualItem = 0;
        SidePanel.visibleItem = 0;
        SidePanel.hideMe(true);
        Header.setFocus(true);
        if (View.actualPage === VideoPlayer) {
            VideoControls.hideControls()
        }
    },
    keyHandler: function(a) {
        SidePanel.resetTimeout(true);
        switch (a) {
            case TVA.tvKey.KEY_UP:
                SidePanel.previous();
                return false;
                break;
            case TVA.tvKey.KEY_DOWN:
                SidePanel.next();
                return false;
                break;
            case TVA.tvKey.KEY_RETURN:
            case TVA.tvKey.KEY_RIGHT:
            case TVA.tvKey.KEY_LEFT:
                SidePanel.closePanel();
                return false;
                break;
            case TVA.tvKey.KEY_ENTER:
                var b = $("#" + SidePanel.elementNames.tableItem + SidePanel.actualItem);
                var c = {
                    programId: b.data("programId"),
                    eventId: b.data("eventId"),
                    assetId: b.data("assetId"),
                    channelId: b.data("channelId")
                };
                if (c.assetId && c.channelId) {
                    VideoPlayer.setDetails("sidePanel", {
                        channelId: c.channelId,
                        programId: null,
                        eventId: null,
                        assetId: c.assetId,
                        isLive: true
                    });
                    SidePanel.hideMe(true);
                    if (View.actualPageIs(VideoPlayer)) {
                        VideoPlayer.changingChannel = true
                    }
                    View.changeView(VideoPlayer)
                } else {
                    PopMsg.show("error", 34, "SP01")
                }
                return false;
                break
        }
        return true
    }
};
var Slider = {
    actualSlide: 0,
    sliderNum: 0,
    slideTimer: null,
    element: null,
    circular: true,
    lastMovement: 0,
    setFocus: function(a) {
        if (View.actualPage == DataSheet) {
            Footer.disableCenter()
        } else {
            if (View.actualPage == Home) {
                var b = [];
                b.push({
                    text: "Ficha",
                    className: "one-button-footer",
                    keycode: TVA.tvKey.KEY_1,
                    method: function() {
                        Slider.moreInfo();
                        return false
                    }
                });
                Footer.setLeft(b)
            }
        }
        if (View.actualFocus === "big-slider") {
            return
        }
        Slider.element = $("#big-slider");
        Commons.offFocus(View.actualFocus);
        Commons.setFocus("big-slider");
        if (!a) {
            Commons.offHover(View.actualHover);
            Commons.setHover("big-slider")
        }
        if (!Slider.circular && Slider.actualSlide == 0) {
            $("#prev-big-slider").addClass("inactive")
        }
        $("#slider" + Slider.actualSlide).removeClass("hide-this");
        Footer.enableLeft()
    },
    reset: function() {
        $("#slider" + Slider.actualSlide).addClass("hide-this");
        Slider.actualSlide = 0;
        Slider.sliderNum = 0
    },
    hideMe: function(a) {
        if (a) {
            $("#big-slider").addClass("hide-this");
            Slider.stopInterval();
            Slider.reset()
        } else {
            $("#big-slider").removeClass("hide-this")
        }
    },
    checkForHoverClass: function() {
        if (!Slider.element.hasClass("hover")) {
            Commons.setHover("big-slider")
        }
    },
    next: function() {
        if (View.actualFocus === "side-panel-container" || View.actualPage === PopUp || PopUp.isVisible == true) {
            Slider.resetInterval();
            return
        }
        Slider.resetInterval();
        Slider.moving();
        Slider.sliderNum = $(".big-slider .info-slide").length;
        var a = (Slider.actualSlide + 1) % Slider.sliderNum;
        if (a <= Slider.sliderNum) {
            if (document.getElementById("slider" + Slider.actualSlide).className.indexOf("hide-this") == -1) {
                $("#slider" + Slider.actualSlide).addClass("hide-this")
            }
            Slider.actualSlide = a;
            $("#slider" + a).removeClass("hide-this");
            if (!Slider.circular) {
                $("#prev-big-slider").removeClass("inactive");
                if (a == Slider.sliderNum) {
                    $("#next-big-slider").addClass("inactive")
                }
            }
        } else {
            if (Slider.circular) {
                Slider.reset();
                $("#slider" + Slider.actualSlide).removeClass("hide-this")
            } else {
                $("#next-big-slider").addClass("inactive")
            }
        }
        if (View.actualPage == Home) {
            Home.loadPromoImg(Slider.actualSlide)
        }
    },
    previous: function() {
        Slider.resetInterval();
        Slider.moving();
        Slider.sliderNum = $(".big-slider .info-slide").length;
        var a = (Slider.actualSlide - 1 + Slider.sliderNum) % Slider.sliderNum;
        if (a >= 0) {
            if (document.getElementById("slider" + Slider.actualSlide).className.indexOf("hide-this") == -1) {
                $("#slider" + Slider.actualSlide).addClass("hide-this")
            }
            Slider.actualSlide = a;
            $("#slider" + a).removeClass("hide-this");
            if (!Slider.circular) {
                $("#next-big-slider").removeClass("inactive");
                if (a == 0) {
                    $("#prev-big-slider").addClass("inactive")
                }
            }
        } else {
            if (Slider.circular) {
                Slider.reset();
                $("#slider" + Slider.actualSlide).removeClass("hide-this")
            } else {
                $("#prev-big-slider").addClass("inactive")
            }
        }
        if (View.actualPage == Home) {
            Home.loadPromoImg(Slider.actualSlide)
        }
    },
    moving: function() {
        this.lastMovement = Utils.now()
    },
    startInterval: function() {
        Slider.moving();
        Slider.stopInterval();
        var a = TVA.OTT.SLIDER_TO;
        if (TVA.OTT.DEVICETYPE == TVA.OTT.DEVICETYPE_BRAVIA) {
            a = a * 2
        }
        Slider.slideTimer = setInterval(Slider.next, a, true)
    },
    stopInterval: function() {
        clearInterval(Slider.slideTimer);
        Slider.slideTimer = null
    },
    resetInterval: function() {
        Slider.startInterval()
    },
    moreInfo: function() {
        var a = Home.promos[Slider.actualSlide];
        if (a && a.datalist) {
            DataList.setDetails(a.datalist, a.datalist["finfo"]);
            View.changeView(DataList);
            return
        }
        DataSheet.setDetails(null, $("#slider" + Slider.actualSlide).data("eventId"));
        View.changeView(DataSheet)
    },
    up: function(a) {
        if (View.actualPage == DataSheet) {
            if (Commons.textScroll(1) && !a) {
                Header.setFocus()
            }
        } else {
            Header.setFocus()
        }
    },
    down: function(a) {
        if (View.actualPage == DataSheet) {
            if (Commons.textScroll(-1) && !a) {
                ThumbSliderFilter.setFocus()
            }
        } else {
            ThumbSliderFilter.setFocus()
        }
    },
    keyHandler: function(a) {
        switch (a) {
            case TVA.tvKey.KEY_UP:
                Slider.up();
                break;
            case TVA.tvKey.KEY_DOWN:
                Slider.down();
                break;
            case TVA.tvKey.KEY_RIGHT:
                if (Slider.canHandleKey(a) == false) {
                    return
                }
                Slider.next();
                Slider.checkForHoverClass();
                break;
            case TVA.tvKey.KEY_LEFT:
                if (Slider.canHandleKey(a) == false) {
                    return
                }
                Slider.previous();
                Slider.checkForHoverClass();
                break;
            case TVA.tvKey.KEY_ENTER:
                Slider.moreInfo();
                break
        }
    },
    canHandleKey: function(a) {
        if (this.lastMovement == 0) {
            this.moving()
        }
        var b = 2000;
        if (TVA.OTT.DEVICETYPE == TVA.OTT.DEVICETYPE_BRAVIA && Utils.now() < this.lastMovement + b) {
            View.loaderShow();
            var c = b + 100 - (Utils.now() - this.lastMovement);
            if (c < 0 || c > b) {
                c = b
            }
            setTimeout(function() {
                Slider.keyHandler(a);
                View.loaderHide()
            }, c);
            return false
        }
        return true
    }
};
var ThumbSlider = {
    actualThumb: 0,
    firstVisible: 0,
    thumbListContainer: "thumbnail-list",
    thumbContainer: "preview-list-thumbnail",
    thumbName: "thumb-horizontal",
    thumbListLength: 0,
    vertical: false,
    scrollConfig: {
        movement: "left",
        maxItemsVisible: 6
    },
    itemsLen: 0,
    promos: [],
    setFocus: function(a) {
        if (View.actualPage == DataSheet || View.actualPage == Home || View.actualPage == VideoPlayer) {
            var b = [];
            b.push({
                text: "Ficha",
                className: "one-button-footer",
                keycode: TVA.tvKey.KEY_1,
                method: function() {
                    ThumbSlider.moreInfo();
                    return false
                }
            });
            if (View.actualPage == VideoPlayer) {
                Footer.setLeft(b)
            } else {
                Footer.setCenter(b);
                Footer.enableCenter()
            }
        }
        if (View.actualPage == Home) {
            var c = [];
            Footer.setLeft(c);
            Footer.disableLeft()
        }
        Footer.enableLeft();
        if (View.actualFocus === ThumbSlider.thumbListContainer) {
            return
        }
        if (ThumbSlider.thumbListLength > 0) {
            Commons.offFocus(View.actualFocus);
            Commons.setFocus(ThumbSlider.thumbListContainer);
            if (!a) {
                Commons.offHover(View.actualHover);
                ThumbSlider.setHover(ThumbSlider.thumbName + ThumbSlider.actualThumb, false);
                if (View.actualPage !== VideoPlayer) {
                    Footer.disableLeft()
                }
            }
        }
    },
    init: function(a) {
        ThumbSlider.thumbListContainer = a.thumbListContainer;
        ThumbSlider.thumbContainer = a.thumbContainer;
        ThumbSlider.thumbName = a.thumbName;
        ThumbSlider.vertical = a.vertical || false;
        ThumbSlider.initScrollConfig(false);
        ThumbSlider.promos = []
    },
    initScrollConfig: function(b) {
        var a = {
            movement: "left",
            maxItemsVisible: 6
        };
        if (b) {
            a = {
                movement: "left",
                maxItemsVisible: 9
            }
        } else {
            if (ThumbSlider.vertical) {
                a = {
                    movement: "top",
                    maxItemsVisible: 4
                }
            }
        }
        a.scrollItemOffset = Math.round(a.maxItemsVisible / 2);
        ThumbSlider.scrollConfig = a
    },
    reset: function(b) {
        var a = $("#" + ThumbSlider.thumbContainer);
        if (b === true) {
            a.empty();
            ThumbSlider.thumbListLength = 0
        }
        a.css(ThumbSlider.scrollConfig.movement, 0);
        ThumbSlider.actualThumb = 0;
        ThumbSlider.firstVisible = 0;
        ThumbSlider.promos = []
    },
    hideMe: function(a) {
        if (a) {
            $("#" + ThumbSlider.thumbListContainer).addClass("hide-this")
        } else {
            $("#" + ThumbSlider.thumbListContainer).removeClass("hide-this")
        }
    },
    build: function(k) {
        if (!View.actualPageIs(Home) && !View.actualPageIs(DataSheet)) {
            return
        }
        ThumbSlider.reset(true);
        if (!k) {
            k = []
        }
        ThumbSlider.promos = k;
        var u = false;
        var g = "";
        for (var p in k) {
            if (k.hasOwnProperty(p)) {
                var s = k[p];
                var o = DataStore.get(Type.Event, s.event);
                var e = DataStore.get(Type.Program, s.program);
                var v = DataStore.get(Type.Channel, o.channel);
                var h = DataStore.get(Type.Asset, s.asset);
                if ((View.actualPage == Mytv) && (!o.channel)) {
                    v = DataStore.get(Type.Channel, s.channel)
                }
                var c = v.id ? v.id : s.channel ? s.channel : 0;
                var r = v.name ? v.name : DataStore.get(Type.Channel, s.channel)["name"];
                var j = "";
                if (e.season) {
                    j = "T" + e.season;
                    if (e.episodePartial) {
                        j += " Ep. " + e.episodePartial
                    }
                } else {
                    j = e.episodeTitle
                }
                var m = ' id="thumb-img-slider-' + p + '" ';
                var l = e.thumbnailUrl;
                var w = "<img class='thumb-img-slider' " + m + " src='resource/general/generic-thumbnail.jpg' data-img='" + API.image_base_url + e.thumbnailUrl + "'  onerror=\"this.onerror=null;this.src='./resource/general/generic-thumbnail.jpg'\"  alt=''>";
                if (!ThumbSlider.vertical && ((s.iotype === "SimilarProgram") || (s.iotype === "Related"))) {
                    w = "<img class='cover thumb-img-slider' " + m + " src='resource/general/generic-cover.jpg' data-img='" + API.image_base_url + e.coverUrl + "'  onerror=\"this.onerror=null;this.src='./resource/general/generic-cover.jpg'\"  alt=''>";
                    l = e.coverUrl;
                    if (l == null) {
                        w = "<img class='cover thumb-img-slider' " + m + " src='resource/general/generic-cover.jpg' alt=''>"
                    }
                    u = true
                } else {
                    if (l == null) {
                        w = "<img class='thumb-img-slider' " + m + " src='resource/general/generic-thumbnail.jpg' alt=''>"
                    }
                }
                var a = " class='thumb-cover' ";
                if (u == false) {
                    a = " class='thumb-slider' "
                }
                g += "<li id='" + ThumbSlider.thumbName + p + "' " + a + " data-programId='" + s.program + "' data-eventId='" + s.event + "' data-channelId='" + c + "' data-assetId='" + s.asset + "' onmouseover='ThumbSlider.setHover(this.id,false); ThumbSlider.actualThumb=" + p + ";' onmouseout='Commons.offHover(this.id);' onclick='ThumbSlider.moreInfo();'>";
                var t = '<div class="thumb-icon-list">';
                if (e.asset) {
                    t += '<img src="resource/1px.png" class="thumb-icon">'
                } else {
                    if (TVA.OTT.SHOW_THUMB_REC_ICON == true) {
                        t += '<img src="resource/1px.png" class="thumb-icon thumb-icon-rec">'
                    }
                }
                t += "</div>";
                g += w;
                g += t;
                g += "<div class='thumb-description'>";
                g += "<h3 class='channel'>" + r + "</h3>";
                if (u == false) {
                    g += "<h4 class='description'>" + e.title + "</h4>"
                }
                g += "<h5 class='description'>" + j + "</h5>";
                if (o) {
                    var q = "";
                    try {
                        var b = o.startTime;
                        if (b && (b != "undefined") && (typeof b == "object")) {
                            q = b.getDate() + " " + Utils.month[b.getMonth()].substr(0, 3) + ",  " + Utils.checkTimeStr(b.getHours()) + ":" + Utils.checkTimeStr(b.getMinutes()) + " h"
                        }
                    } catch (d) {
                        q = ""
                    }
                    if (q != "") {
                        g += "<h5 class='description'>" + q + "</h5>"
                    }
                }
                g += "</div>";
                g += "<div class='list-thumb-div-rect'></div>";
                if (u == true) {
                    g += "<div class='thumb-title'>" + e.title + "</div>";
                    var n = parseInt(e.season);
                    if (!isNaN(n) && n > 0) {
                        g += "<div class='cover-season' ><div>T" + e.season + "</div></div>"
                    }
                }
                g += "</li>";
                ThumbSlider.promos[p]["datalist"] = null;
                if (e.parent) {
                    var f = DataStore.get(Type.Program, e.parent);
                    if (f && f.isGroup === true) {
                        ThumbSlider.promos[p]["datalist"] = {
                            programId: (e ? e.id : ""),
                            eventId: (o ? o.id : ""),
                            channelId: (o.channel && o.channel["id"] ? o.channel["id"] : ""),
                            parentId: (e ? e.parent : ""),
                            assetId: (h ? h.id : ""),
                            program: f,
                            programNode: e,
                            finfo: {
                                programId: (e ? e.id : ""),
                                assetId: (h ? h.id : ""),
                                eventId: (o ? o.id : "")
                            }
                        }
                    }
                }
            }
        }
        ThumbSlider.initScrollConfig(u);
        ThumbSlider.itemsLen = k.length;
        if (k.length <= ThumbSlider.scrollConfig.maxItemsVisible) {
            ThumbSlider.sliderArrowsVisibility("hide")
        } else {
            ThumbSlider.sliderArrowsVisibility("show")
        }
        TVA.putInnerHTML(document.getElementById(ThumbSlider.thumbContainer), g);
        ThumbSlider.thumbListLength = ++p;
        ThumbSlider.hideMe(false);
        this.hideOrShowArrows(k.length);
        ThumbSlider.checkImages();
        TVA.invalidate()
    },
    hideOrShowArrows: function(b) {
        var c = "",
            a = "";
        if (ThumbSlider.scrollConfig.movement == "left") {
            c = "#arrow-left-" + ThumbSlider.thumbName;
            a = "#arrow-right-" + ThumbSlider.thumbName
        } else {
            c = "#arrow-up-" + ThumbSlider.thumbName;
            a = "#arrow-down-" + ThumbSlider.thumbName
        }
        var e = $(c).attr("pclass");
        var d = $(a).attr("pclass");
        if (b <= ThumbSlider.scrollConfig.maxItemsVisible) {
            $(c).hide();
            $(a).hide();
            if (e && e != "") {
                $("." + e).hide()
            }
            if (d && d != "") {
                $("." + d).hide()
            }
        } else {
            $(c).show();
            $(a).show();
            if (e && e != "") {
                $("." + e).show()
            }
            if (d && d != "") {
                $("." + d).show()
            }
        }
        ThumbSlider.setHover("", true)
    },
    scroll: function(a, b) {
        b = b || 1;
        Commons.scroll(a, {
            list: "#" + ThumbSlider.thumbContainer,
            listItem: "li",
            itemMove: "#" + ThumbSlider.thumbContainer,
            displayItems: ThumbSlider.scrollConfig.maxItemsVisible,
            movement: ThumbSlider.scrollConfig.movement,
            offset: 0
        }, b)
    },
    checkScrolling: function(b, d) {
        if (ThumbSlider.thumbListLength > ThumbSlider.scrollConfig.maxItemsVisible) {
            var a = ThumbSlider.firstVisible;
            var c = a + ThumbSlider.scrollConfig.maxItemsVisible;
            if (c > ThumbSlider.thumbListLength) {
                c = ThumbSlider.thumbListLength
            }
            if (d) {
                if (ThumbSlider.firstVisible > 0 && b < a + ThumbSlider.scrollConfig.scrollItemOffset - 1) {
                    ThumbSlider.scroll(-1);
                    ThumbSlider.firstVisible--
                }
            } else {
                if (c < ThumbSlider.thumbListLength && b > c - ThumbSlider.scrollConfig.scrollItemOffset) {
                    ThumbSlider.scroll(1);
                    ThumbSlider.firstVisible++
                }
            }
        }
        ThumbSlider.checkImages()
    },
    checkImages: function() {
        var b = ThumbSlider.firstVisible + ThumbSlider.scrollConfig.maxItemsVisible;
        for (var c = ThumbSlider.firstVisible; c < b; c++) {
            var d = $("#thumb-img-slider-" + c);
            if (d.length > 0) {
                var a = d.data("img");
                if (a && a != "") {
                    d.data("img", "").attr("src", a)
                }
            }
        }
    },
    next: function() {
        var a = ThumbSlider.actualThumb + 1;
        if (a < ThumbSlider.thumbListLength) {
            ThumbSlider.checkScrolling(a);
            ThumbSlider.actualThumb = a
        }
        ThumbSlider.setHover(ThumbSlider.thumbName + ThumbSlider.actualThumb, false)
    },
    previous: function() {
        var a = ThumbSlider.actualThumb - 1;
        if (a >= 0) {
            ThumbSlider.checkScrolling(a, true);
            ThumbSlider.actualThumb = a
        }
        ThumbSlider.setHover(ThumbSlider.thumbName + ThumbSlider.actualThumb, false)
    },
    moreInfo: function() {
        var a = ThumbSlider.promos[ThumbSlider.actualThumb];
        if (a && a.datalist) {
            DataList.setDetails(a.datalist, a.datalist["finfo"]);
            View.changeView(DataList);
            return
        }
        var b = $("#" + ThumbSlider.thumbName + ThumbSlider.actualThumb);
        DataSheet.setDetails(b.data("programId"), b.data("eventId"), b.data("channelId"));
        View.changeView(DataSheet)
    },
    sliderArrowsVisibility: function(b) {
        var a = "";
        if (View.actualPage === VideoPlayer) {
            a = "-video"
        }
        if (ThumbSlider.vertical == true) {
            if (b === "show") {
                $("#arrow-up-thumb-vertical" + a).removeClass("hide-this");
                $("#arrow-down-thumb-vertical" + a).removeClass("hide-this");
                if (a == "") {
                    $("#arrow-up-thumb-vertical-video").addClass("hide-this");
                    $("#arrow-down-thumb-vertical-video").addClass("hide-this")
                } else {
                    $("#arrow-up-thumb-vertical").addClass("hide-this");
                    $("#arrow-down-thumb-vertical").addClass("hide-this")
                }
            } else {
                $("#arrow-up-thumb-vertical" + a).addClass("hide-this");
                $("#arrow-down-thumb-vertical" + a).addClass("hide-this")
            }
        } else {
            if (b === "show") {
                $("#arrow-right-thumb-horizontal" + a).removeClass("hide-this");
                $("#arrow-left-thumb-horizontal" + a).removeClass("hide-this")
            } else {
                $("#arrow-right-thumb-horizontal" + a).addClass("hide-this");
                $("#arrow-left-thumb-horizontal" + a).addClass("hide-this")
            }
        }
    },
    keyHandler: function(a) {
        switch (a) {
            case TVA.tvKey.KEY_UP:
                if (View.actualPage === Mytv) {
                    ThumbSlider.previous()
                } else {
                    ThumbSliderFilter.setFocus()
                }
                break;
            case TVA.tvKey.KEY_DOWN:
                if (View.actualPage === Mytv) {
                    ThumbSlider.next()
                }
                break;
            case TVA.tvKey.KEY_RIGHT:
                if (View.actualPage !== Mytv) {
                    ThumbSlider.next()
                }
                break;
            case TVA.tvKey.KEY_LEFT:
                if (View.actualPage === Mytv) {
                    LeftPanel.setFocus()
                } else {
                    ThumbSlider.previous()
                }
                break;
            case TVA.tvKey.KEY_ENTER:
                ThumbSlider.moreInfo();
                break
        }
    },
    setHover: function(g, c) {
        if (c !== true) {
            Commons.setHover(g)
        }
        try {
            if (ThumbSlider.itemsLen > ThumbSlider.scrollConfig.maxItemsVisible) {
                if (ThumbSlider.scrollConfig.movement == "left") {
                    a1 = "#arrow-left-" + ThumbSlider.thumbName;
                    a2 = "#arrow-right-" + ThumbSlider.thumbName
                } else {
                    a1 = "#arrow-up-" + ThumbSlider.thumbName;
                    a2 = "#arrow-down-" + ThumbSlider.thumbName
                }
                var f = $(a1).attr("pclass");
                var d = $(a2).attr("pclass");
                var a = g.replace(ThumbSlider.thumbName, "");
                if (a == 0 && g != "") {
                    $(a1).hide();
                    if (f && f != "") {
                        $("." + f).hide()
                    }
                } else {
                    $(a1).show();
                    if (f && f != "") {
                        $("." + f).show()
                    }
                }
                if (a == ThumbSlider.itemsLen - 1 && g != "") {
                    $(a2).hide();
                    if (d && d != "") {
                        $("." + d).hide()
                    }
                } else {
                    $(a2).show();
                    if (d && d != "") {
                        $("." + d).show()
                    }
                }
            }
        } catch (b) {}
    }
};
var ThumbSliderFilter = {
    actualFilter: 0,
    activeFilter: 0,
    filterOptions: 0,
    mode: "",
    setFocus: function(a) {
        if (View.actualPage == DataSheet) {
            Footer.disableCenter()
        } else {
            if (View.actualPage == Home) {
                var b = [];
                Footer.setLeft(b);
                Footer.disableLeft();
                Footer.setCenter(b);
                Footer.disableCenter()
            }
        }
        if (View.actualFocus === "filter-thumbnail-list-container") {
            return
        }
        Commons.offFocus(View.actualFocus);
        Commons.setFocus("filter-thumbnail-list-container");
        if (!a) {
            var c = ThumbSliderFilter.getFirstVisibleFilter();
            if (c >= 0) {
                Commons.offHover(View.actualHover);
                Commons.setHover("filter-thumbs" + ThumbSliderFilter.actualFilter);
                $("#filter-thumbs" + ThumbSliderFilter.actualFilter).addClass("active");
                Footer.disableLeft()
            } else {
                ThumbSliderFilter.actualFilter = 0
            }
        }
    },
    getFirstVisibleFilter: function() {
        var c = false;
        var b = 0;
        while (b < 10) {
            var a = $("#filter-thumbs" + b);
            if (!a || !a.length) {
                break
            } else {
                if (a.hasClass("hide-this") == false) {
                    c = true;
                    break
                }
            }
            b++
        }
        if (c == true) {
            return b
        }
        return -1
    },
    reset: function() {
        ThumbSliderFilter.actualFilter = 0;
        ThumbSliderFilter.activeFilter = 0;
        $("#filter-thumbs" + ThumbSliderFilter.activeFilter).removeClass("active")
    },
    hideMe: function(a) {
        if (a) {
            $("#filter-thumbnail-list-container").addClass("hide-this")
        } else {
            $("#filter-thumbnail-list-container").removeClass("hide-this")
        }
    },
    externalOptions: null,
    waiting: 0,
    waitTimeout: null,
    setOptions: function(h) {
        ThumbSliderFilter.filterOptions = 0;
        ThumbSliderFilter.mode = h;
        var f = "";
        if (ThumbSliderFilter.mode === "datasheet-event-serie" || ThumbSliderFilter.mode === "datasheet-program-serie") {
            f = '<li id="filter-thumbs0" class="filter-thumbs active" onmouseover="Commons.setHover(this.id); ThumbSliderFilter.actualFilter=0;" onmouseout="Commons.offHover(this.id);" onclick="ThumbSliderFilter.keyHandler(TVA.tvKey.KEY_ENTER);">Cap&iacute;tulos</li><li id="filter-thumbs1" class="filter-thumbs filter-thumbs-seasons" onmouseover="Commons.setHover(this.id); ThumbSliderFilter.actualFilter=1;" onmouseout="Commons.offHover(this.id);" onclick="ThumbSliderFilter.keyHandler(TVA.tvKey.KEY_ENTER);">Temporadas</li>';
            ThumbSliderFilter.filterOptions = 2
        } else {
            if (ThumbSliderFilter.mode === "datasheet-event-deportes") {
                f = '<li id="filter-thumbs0" class="filter-thumbs active" onmouseover="Commons.setHover(this.id); ThumbSliderFilter.actualFilter=0;" onmouseout="Commons.offHover(this.id);" onclick="ThumbSliderFilter.keyHandler(TVA.tvKey.KEY_ENTER);">Eventos</li>';
                ThumbSliderFilter.filterOptions = 1
            } else {
                if (ThumbSliderFilter.mode === "datasheet-program" || ThumbSliderFilter.mode === "datasheet-event") {
                    f = '<li id="filter-thumbs0" class="filter-thumbs active" onmouseover="Commons.setHover(this.id); ThumbSliderFilter.actualFilter=0;" onmouseout="Commons.offHover(this.id);" onclick="ThumbSliderFilter.keyHandler(TVA.tvKey.KEY_ENTER);">Similares</li>';
                    ThumbSliderFilter.filterOptions = 1
                } else {
                    if (ThumbSliderFilter.mode === "datasheet-program-master") {
                        f = '<li id="filter-thumbs0" class="filter-thumbs active" onmouseover="Commons.setHover(this.id); ThumbSliderFilter.actualFilter=0;" onmouseout="Commons.offHover(this.id);" onclick="ThumbSliderFilter.keyHandler(TVA.tvKey.KEY_ENTER);">Cap&iacute;tulos</li><li id="filter-thumbs1" class="filter-thumbs" onmouseover="Commons.setHover(this.id); ThumbSliderFilter.actualFilter=1;" onmouseout="Commons.offHover(this.id);" onclick="ThumbSliderFilter.keyHandler(TVA.tvKey.KEY_ENTER);">Similares</li>';
                        ThumbSliderFilter.filterOptions = 2
                    }
                }
            }
        }
        var c = ThumbSliderFilter.externalOptions;
        if (ThumbSliderFilter.externalOptions === null) {
            ThumbSliderFilter.waiting++;
            clearTimeout(ThumbSliderFilter.waitTimeout);
            if (ThumbSliderFilter.waiting < 5) {
                ThumbSliderFilter.waitTimeout = setTimeout(function() {
                    ThumbSliderFilter.setOptions(h)
                }, 2000);
                return
            } else {
                c = ThumbSliderFilter.getDefaultJsonResponse()
            }
        }
        if (c !== null) {
            var b = ThumbSliderFilter.filterOptions;
            var a = "";
            var e = "";
            var g = false;
            for (var d = 0; d < c.length; d++) {
                a = c[d].description;
                if (typeof c[d].label === "string" && c[d].label.length > 0) {
                    a = '<span class="thumbs-span"><div>' + c[d].label + '</div></span><span class="thumbs-arrow">&nbsp;</span>' + a
                }
                g = false;
                e = "";
                switch (c[d].section) {
                    case "home":
                        if (ThumbSliderFilter.mode === "home-logged-in" || ThumbSliderFilter.mode === "home-not-logged-in") {
                            g = true
                        }
                        break;
                    case "datasheet":
                        if (ThumbSliderFilter.mode !== "home-logged-in" && ThumbSliderFilter.mode !== "home-not-logged-in") {
                            g = true
                        }
                        break;
                    default:
                        break
                }
                if (g == true) {
                    f += '<li id="filter-thumbs' + b + '" data-action="' + c[d].action + '" action="' + c[d].action + '" class="filter-thumbs' + e + (b == 0 ? " active" : "") + '" onmouseover="Commons.setHover(this.id); ThumbSliderFilter.actualFilter=' + b + ';" onmouseout="Commons.offHover(this.id);" onclick="ThumbSliderFilter.keyHandler(TVA.tvKey.KEY_ENTER);">' + a + "</li>";
                    b++
                }
            }
        }
        if (f === "") {
            return
        }
        TVA.putInnerHTML(document.getElementById("filter-thumbs-list"), f);
        ThumbSliderFilter.filterOptions = $("#filter-thumbs-list").find("li").length;
        if (c !== null) {
            if (View.actualPageIs(Home)) {
                ThumbSliderFilter.loadTab()
            }
        }
    },
    getDefaultJsonResponse: function() {
        return [{
            section: "home",
            action: "watch-now",
            description: "Para ver ahora",
            label: ""
        }, {
            section: "home",
            action: "featured",
            description: "Destacados",
            label: ""
        }, {
            section: "home",
            action: "recommended",
            description: "Recomendados",
            label: ""
        }, {
            section: "home",
            action: "most-viewed",
            description: "M&aacute;s Vistos",
            label: ""
        }, {
            section: "home",
            action: "highest-rated",
            description: "Mejor Valorados",
            label: ""
        }, {
            section: "datasheet",
            action: "recommended",
            description: "Recomendados",
            label: ""
        }, {
            section: "datasheet",
            action: "most-viewed",
            description: "M&aacute;s Vistos",
            label: ""
        }, {
            section: "datasheet",
            action: "highest-rated",
            description: "Mejor Valorados",
            label: ""
        }]
    },
    jsonResponse: function(a) {
        if (typeof a !== "object" || a === null || a.length <= 0) {
            a = ThumbSliderFilter.getDefaultJsonResponse()
        }
        ThumbSliderFilter.externalOptions = a;
        clearTimeout(ThumbSliderFilter.waitTimeout);
        ThumbSliderFilter.setOptions(ThumbSliderFilter.mode)
    },
    hideSeasonsTab: function(a) {
        if (a) {
            $("#filter-thumbs-list").find(".filter-thumbs-seasons").addClass("hide-this")
        } else {
            $("#filter-thumbs-list").find(".filter-thumbs-seasons").removeClass("hide-this")
        }
    },
    loadTab: function() {
        var a = ThumbSliderFilter.getFirstVisibleFilter();
        if (a >= 0) {
            ThumbSliderFilter.actualFilter = a;
            $("#filter-thumbs" + ThumbSliderFilter.actualFilter).addClass("active");
            ThumbSliderFilter.keyHandler(TVA.tvKey.KEY_ENTER, false)
        }
    },
    keyHandler: function(m, p, f) {
        if (typeof p === "undefined") {
            p = true
        }
        if (typeof f === "undefined") {
            f = false
        }
        switch (m) {
            case TVA.tvKey.KEY_UP:
                if (f == false) {
                    Slider.setFocus()
                } else {
                    if (!VideoControls.isHidden) {
                        Header.setFocus()
                    }
                }
                break;
            case TVA.tvKey.KEY_DOWN:
                if (f == true) {
                    Commons.offFocus(View.actualFocus);
                    Commons.offHover(View.actualHover);
                    View.actualFocus = ""
                }
                ThumbSlider.setFocus();
                break;
            case TVA.tvKey.KEY_RIGHT:
                var d = ThumbSliderFilter.actualFilter + 1;
                while ($("#filter-thumbs" + d).is(":visible") == false && d < ThumbSliderFilter.filterOptions) {
                    d++
                }
                if (d < ThumbSliderFilter.filterOptions) {
                    Commons.offHover(View.actualHover);
                    ThumbSliderFilter.actualFilter = d;
                    Commons.setHover("filter-thumbs" + ThumbSliderFilter.actualFilter)
                }
                break;
            case TVA.tvKey.KEY_LEFT:
                var c = ThumbSliderFilter.actualFilter - 1;
                while ($("#filter-thumbs" + c).is(":visible") == false && c >= 0) {
                    c--
                }
                if (c >= 0) {
                    Commons.offHover(View.actualHover);
                    ThumbSliderFilter.actualFilter = c;
                    Commons.setHover("filter-thumbs" + ThumbSliderFilter.actualFilter)
                }
                break;
            case TVA.tvKey.KEY_ENTER:
                if (p == true) {
                    $("#filter-thumbs" + ThumbSliderFilter.activeFilter).removeClass("active")
                }
                ThumbSliderFilter.activeFilter = ThumbSliderFilter.actualFilter;
                var g = $("#filter-thumbs" + ThumbSliderFilter.actualFilter);
                if (p == true) {
                    g.addClass("active")
                }
                try {
                    var b = DataSheet.details.programId;
                    if (!b && DataSheet.details.eventId) {
                        var o = DataStore.get(Type.Event, DataSheet.details.eventId);
                        b = o.program;
                        if (b) {
                            DataSheet.details.programId = b
                        }
                    }
                } catch (n) {}
                var l = null;
                try {
                    l = g.data("action")
                } catch (k) {
                    l = null
                }
                if (typeof l === "string" && l.length > 0) {
                    l = [l, "", false];
                    j = API.getSliderContent.apply(null, l)
                } else {
                    var i = null,
                        h = null,
                        a = null;
                    var j = false;
                    switch (ThumbSliderFilter.mode) {
                        case "datasheet-event":
                            if (ThumbSliderFilter.actualFilter == 0) {
                                j = API.getSliderContent("similar-programs", DataSheet.details.programId, false)
                            } else {
                                if (ThumbSliderFilter.actualFilter == 1) {
                                    j = API.getSliderContent("recommended", "", false)
                                } else {
                                    if (ThumbSliderFilter.actualFilter == 2) {
                                        j = API.getSliderContent("most-viewed", "", false)
                                    } else {
                                        if (ThumbSliderFilter.actualFilter == 3) {
                                            j = API.getSliderContent("highest-rated", "", false)
                                        }
                                    }
                                }
                            }
                            break;
                        case "datasheet-program":
                            if (ThumbSliderFilter.actualFilter == 0) {
                                j = API.getSliderContent("similar-programs", DataSheet.details.programId, false)
                            } else {
                                if (ThumbSliderFilter.actualFilter == 1) {
                                    j = API.getSliderContent("recommended", "", false)
                                } else {
                                    if (ThumbSliderFilter.actualFilter == 2) {
                                        j = API.getSliderContent("most-viewed", "", false)
                                    } else {
                                        if (ThumbSliderFilter.actualFilter == 3) {
                                            j = API.getSliderContent("highest-rated", "", false)
                                        }
                                    }
                                }
                            }
                            break;
                        case "datasheet-event-serie":
                            if (ThumbSliderFilter.actualFilter == 0) {
                                a = DataStore.get(Type.Event, DataSheet.details.eventId);
                                h = DataStore.get(Type.Program, a.program);
                                i = (h.master ? h.master : (h.parent ? h.parent : DataSheet.details.programId));
                                j = API.getSliderContent("catch", i, true)
                            } else {
                                if (ThumbSliderFilter.actualFilter == 1) {
                                    a = DataStore.get(Type.Event, DataSheet.details.eventId);
                                    h = DataStore.get(Type.Program, a.program);
                                    i = (h.master ? h.master : (h.parent ? h.parent : DataSheet.details.programId));
                                    j = API.getSliderContent("seasons", i, true, a.channel ? a.channel : DataSheet.details.channelId)
                                } else {
                                    if (ThumbSliderFilter.actualFilter == 2) {
                                        j = API.getSliderContent("similar-programs", DataSheet.details.programId, false)
                                    } else {
                                        if (ThumbSliderFilter.actualFilter == 3) {
                                            j = API.getSliderContent("recommended", "", false)
                                        } else {
                                            if (ThumbSliderFilter.actualFilter == 4) {
                                                j = API.getSliderContent("most-viewed", "", false)
                                            } else {
                                                if (ThumbSliderFilter.actualFilter == 5) {
                                                    j = API.getSliderContent("highest-rated", "", false)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            break;
                        case "datasheet-program-serie":
                            if (ThumbSliderFilter.actualFilter == 0) {
                                h = DataStore.get(Type.Program, DataSheet.details.programId);
                                i = (h.master ? h.master : (h.parent ? h.parent : DataSheet.details.programId));
                                j = API.getSliderContent("catch", i, true)
                            } else {
                                if (ThumbSliderFilter.actualFilter == 1) {
                                    h = DataStore.get(Type.Program, DataSheet.details.programId);
                                    i = (h.master ? h.master : (h.parent ? h.parent : DataSheet.details.programId));
                                    j = API.getSliderContent("seasons", i, true, DataSheet.details.channelId)
                                } else {
                                    if (ThumbSliderFilter.actualFilter == 2) {
                                        j = API.getSliderContent("similar-programs", DataSheet.details.programId, false)
                                    } else {
                                        if (ThumbSliderFilter.actualFilter == 3) {
                                            j = API.getSliderContent("recommended", "", false)
                                        } else {
                                            if (ThumbSliderFilter.actualFilter == 4) {
                                                j = API.getSliderContent("most-viewed", "", false)
                                            } else {
                                                if (ThumbSliderFilter.actualFilter == 5) {
                                                    j = API.getSliderContent("highest-rated", "", false)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            break;
                        case "datasheet-program-master":
                            if (ThumbSliderFilter.actualFilter == 0) {
                                j = API.getSliderContent("catch", DataSheet.details.programId, true)
                            } else {
                                if (ThumbSliderFilter.actualFilter == 1) {
                                    j = API.getSliderContent("similar-programs", DataSheet.details.programId, false)
                                }
                            }
                            break
                    }
                }
                Commons.scrollIni({
                    list: "#preview-list-thumbnail",
                    movement: "left",
                    offset: 0
                });
                ThumbSlider.actualThumb = 0;
                ThumbSlider.visibleThumb = 0;
                if (j == true && p === true) {
                    Commons.setHover("thumb-horizontal" + ThumbSlider.actualThumb);
                    ThumbSlider.setFocus()
                }
                break
        }
    }
};
var LeftPanel = {
    mytv: false,
    actualItem: 0,
    itemListLength: 0,
    visibleItem: 0,
    listBoxDisplay: 0,
    scrollLimit: 0,
    setFocus: function() {
        Commons.offFocus(View.actualFocus);
        Commons.offHover(View.actualHover);
        Commons.setFocus("left-panel");
        $("#selector-multi-panel").removeClass("hide-this");
        if (LeftPanel.mytv) {
            Footer.enableLeft()
        }
        var a = $("#left-panel-list");
        if (a.find(".displayed").length > 0) {
            LeftPanel.setHover(LeftPanel.actualItem, true)
        } else {
            Header.setFocus()
        }
        LeftPanel.refreshTotalItemCount();
        LeftPanel.checkScrollIcons();
        a.parent().css("height", LeftPanel.listBoxDisplay * parseInt(a.find("li").height()));
        $("#left-panel-scroll-down").css("top", a.parent().css("height"));
        LeftPanel.hideMe(false);
        LeftPanel.unloadFooter()
    },
    unloadFooter: function() {
        var a = [];
        Footer.setCenter(a);
        Footer.disableCenter()
    },
    init: function(a) {
        LeftPanel.reset();
        LeftPanel.listBoxDisplay = a.displayItems;
        LeftPanel.scrollLimit = a.scrollLimit;
        LeftPanel.mytv = a.mytv;
        LeftPanel.datalist = a.datalist ? a.datalist : false;
        if (a.title) {
            $("#left-panel-title").removeClass("hide-this")
        } else {
            $("#left-panel-title").addClass("hide-this")
        }
        if (a.actualPos) {
            $("#left-panel-actual-pos").removeClass("hide-this")
        } else {
            $("#left-panel-actual-pos").addClass("hide-this")
        }
        $("#left-panel-describe").removeClass().addClass(a.classC)
    },
    reset: function() {
        TVA.putInnerHTML(document.getElementById("left-panel-list"), "");
        TVA.putInnerHTML(document.getElementById("total-left-panel"), "");
        TVA.putInnerHTML(document.getElementById("current-item-left-panel"), "");
        $("#left-panel-list").css("top", 0);
        LeftPanel.actualItem = 0;
        LeftPanel.itemListLength = 0;
        LeftPanel.visibleItem = 0;
        LeftPanel.mytv = false;
        Mytv.currentInfoLoaded = null;
        DataList.currentInfoLoaded = null;
        try {
            window.clearTimeout(Mytv.infoTimeout);
            Mytv.infoTimeout = null
        } catch (a) {}
        try {
            window.clearTimeout(DataList.infoTimeout);
            DataList.infoTimeout = null
        } catch (a) {}
    },
    hideMe: function(a) {
        if (a) {
            $("#left-panel-scroll-down").addClass("hide-this");
            $("#left-panel-scroll-up").addClass("hide-this");
            $("#left-panel").addClass("hide-this");
            Commons.offFocus(View.actualFocus);
            Commons.offHover(View.actualHover)
        } else {
            $("#left-panel").removeClass("hide-this")
        }
    },
    scroll: function(a) {
        Commons.scroll(a, {
            list: "#left-panel-list",
            listItem: "li.displayed",
            itemMove: "#left-panel-list",
            displayItems: LeftPanel.listBoxDisplay,
            movement: "top",
            offset: 0
        }, 1)
    },
    checkScrollIcons: function() {
        var b = (LeftPanel.actualItem < $("#left-panel-list").find("li.displayed").length - 1);
        var a = (LeftPanel.actualItem != 0);
        if (b) {
            $("#left-panel-scroll-down").removeClass("hide-this")
        } else {
            $("#left-panel-scroll-down").addClass("hide-this")
        }
        if (a) {
            $("#left-panel-scroll-up").removeClass("hide-this")
        } else {
            $("#left-panel-scroll-up").addClass("hide-this")
        }
    },
    next: function() {
        var c = LeftPanel.actualItem + 1;
        if (c < LeftPanel.itemListLength) {
            LeftPanel.visibleItem = LeftPanel.visibleItem + 1;
            if ((LeftPanel.visibleItem > LeftPanel.scrollLimit) && (LeftPanel.actualItem < (LeftPanel.itemListLength - (LeftPanel.listBoxDisplay - LeftPanel.scrollLimit)))) {
                LeftPanel.visibleItem = LeftPanel.scrollLimit;
                LeftPanel.scroll(1)
            }
            LeftPanel.actualItem = c;
            var b = $("#left-panel-list");
            var e = b.find("li.displayed").eq(LeftPanel.actualItem);
            var d = 0;
            var a = b.parent();
            while (b.position().top + e.position().top >= a.height() && d++ < LeftPanel.scrollLimit) {
                LeftPanel.scroll(1)
            }
            LeftPanel.checkScrollIcons();
            LeftPanel.setHover(LeftPanel.actualItem)
        }
        TVA.putInnerHTML(document.getElementById("current-item-left-panel"), LeftPanel.actualItem + 1)
    },
    previous: function(e) {
        var b = LeftPanel.actualItem - 1;
        if (b >= 0) {
            LeftPanel.visibleItem = LeftPanel.visibleItem - 1;
            if ((LeftPanel.visibleItem < LeftPanel.scrollLimit) && (LeftPanel.actualItem > LeftPanel.scrollLimit)) {
                LeftPanel.visibleItem = LeftPanel.scrollLimit;
                LeftPanel.scroll(-1)
            }
            LeftPanel.actualItem = b;
            var a = $("#left-panel-list");
            var d = a.find("li.displayed").eq(LeftPanel.actualItem);
            var c = 0;
            while (a.position().top + d.position().top < 0 && c++ < LeftPanel.scrollLimit) {
                LeftPanel.scroll(-1)
            }
            LeftPanel.setHover(LeftPanel.actualItem)
        } else {
            if (!e) {
                LeftPanel.visibleItem = 0;
                LeftPanel.actualItem = 0;
                Header.setFocus()
            }
        }
        LeftPanel.checkScrollIcons();
        TVA.putInnerHTML(document.getElementById("current-item-left-panel"), LeftPanel.actualItem + 1)
    },
    setHover: function(g, k) {
        var f = $("#left-panel-list").find("li.displayed").eq(g);
        if (f) {
            if (f.attr("id")) {
                Commons.setHover(f.attr("id"))
            }
            if (LeftPanel.mytv || LeftPanel.datalist) {
                var h = f.data("programId");
                var a = f.data("masterId");
                var d = LeftPanel.mytv ? Mytv : DataList;
                if (h && h != d.currentInfoLoaded) {
                    window.clearTimeout(d.infoTimeout);
                    d.infoTimeout = null;
                    var b = 500;
                    if (k) {
                        b = 10
                    }
                    d.moveFocus(0, 1);
                    d.infoTimeout = window.setTimeout(function() {
                        d.loadInfo(h, a);
                        d.infoTimeout = null
                    }, b)
                } else {
                    if (h && h == d.currentInfoLoaded) {
                        if (d == DataList) {
                            d.moveFocus(0, -1, true)
                        }
                    }
                }
                LeftPanel.disableDelete(f)
            } else {
                var c = f.data("itemId");
                if (c && View.actualPage && View.actualPage.loadInfo) {
                    try {
                        View.actualPage.loadInfo(c)
                    } catch (j) {}
                }
            }
            return true
        } else {
            return false
        }
    },
    applyFilter: function() {
        if (!LeftPanel.mytv) {
            $("#left-panel-list").find("li").removeClass("left-panel-selected");
            var c = $($("#left-panel-list").find("li.displayed")[LeftPanel.actualItem]);
            var b = c.data("filterKey");
            var a = c.data("filterArg");
            TVA.putInnerHTML(document.getElementById("scroll-grid-container"), "");
            API.getStorefrontChannels(Storefront.mode, b, a);
            c.addClass("left-panel-selected")
        }
    },
    refreshTotalItemCount: function() {
        LeftPanel.itemListLength = $("#left-panel-list").find("li:not(.hide-this)").length;
        if (LeftPanel.itemListLength > 0) {
            TVA.putInnerHTML(document.getElementById("total-left-panel"), " de " + LeftPanel.itemListLength)
        } else {
            TVA.putInnerHTML(document.getElementById("total-left-panel"), "")
        }
    },
    checkMaster: function(a) {
        if (LeftPanel.mytv) {
            if ($(a).hasClass("master")) {
                return true
            }
        }
        return false
    },
    disableDelete: function(a) {
        if (LeftPanel.mytv) {
            var b = $("#left-controls");
            if (LeftPanel.checkMaster(a) || (Mytv.type == "you-missed-it")) {
                b.find(".two-button-footer").addClass("disabled")
            } else {
                b.find(".two-button-footer").removeClass("disabled")
            }
        }
    },
    hoverTo: function(b, e) {
        var d = b;
        if (View.actualPage === Mytv || View.actualPage === DataList) {
            var a = "left-panel-option" + b;
            if (e >= 0) {
                a = "child-panel-option" + b + "-" + e
            }
            $("#left-panel-list").find("li.displayed").each(function(f) {
                if ($(this).attr("id") == a) {
                    d = f;
                    return false
                }
                return true
            })
        }
        var c = (LeftPanel.visibleItem - LeftPanel.actualItem);
        LeftPanel.actualItem = d;
        LeftPanel.visibleItem = LeftPanel.actualItem + c;
        LeftPanel.setHover(LeftPanel.actualItem);
        TVA.putInnerHTML(document.getElementById("current-item-left-panel"), LeftPanel.actualItem + 1);
        LeftPanel.checkScrollIcons()
    },
    click: function(a) {
        LeftPanel.keyHandler(a ? a : TVA.tvKey.KEY_ENTER)
    },
    keyHandler: function(j) {
        switch (j) {
            case TVA.tvKey.KEY_UP:
                LeftPanel.previous();
                break;
            case TVA.tvKey.KEY_LEFT:
                if (!LeftPanel.mytv && !LeftPanel.datalist) {
                    break
                }
            case TVA.tvKey.KEY_RIGHT:
                if (LeftPanel.mytv || LeftPanel.datalist) {
                    var b = LeftPanel.mytv ? Mytv : DataList;
                    b.moveFocus(j == TVA.tvKey.KEY_LEFT ? -1 : 1)
                } else {
                    GridPanel.setFocus()
                }
                break;
            case TVA.tvKey.KEY_DOWN:
                LeftPanel.next();
                break;
            case TVA.tvKey.KEY_PLAY:
            case TVA.tvKey.KEY_ENTER:
                var b = LeftPanel.mytv ? Mytv : DataList;
                if (b && b.infoTimeout != null) {
                    return
                }
                if (LeftPanel.mytv && Mytv.buttonsPosition == 0) {
                    if (Mytv.playAsset() == true) {
                        break
                    }
                } else {
                    if (LeftPanel.datalist && DataList.buttonsPosition == 0) {
                        if ($(".mytv-button-1").hasClass("mytv-button-play") && DataList.playAsset() == true) {
                            break
                        } else {
                            if ($(".mytv-button-1").hasClass("mytv-button-rec") && DataList.recAsset() == true) {
                                break
                            }
                        }
                    } else {
                        if (LeftPanel.datalist && DataList.buttonsPosition == -1) {
                            if (DataList.loadNode() == true) {
                                break
                            }
                        } else {
                            if (LeftPanel.mytv && Mytv.buttonsPosition == -1) {
                                if (Mytv.loadNode() == true) {
                                    break
                                }
                            }
                        }
                    }
                }
            case TVA.tvKey.KEY_1:
                if (LeftPanel.mytv || LeftPanel.datalist) {
                    var c = $("#left-panel-list").find("li.displayed").eq(LeftPanel.actualItem);
                    var k = $("#middle-preview-panel").find(".votar-btn");
                    if (k && k.length && k.html().indexOf("-on") > 0) {
                        var b = LeftPanel.mytv ? Mytv : DataList;
                        b.clickButton(3);
                        return true
                    }
                    if (c.hasClass("master")) {
                        if (j == TVA.tvKey.KEY_1) {
                            return false
                        }
                        var e = $("." + c.attr("id"));
                        if (e.hasClass("hide-this")) {
                            e.addClass("displayed").removeClass("hide-this");
                            c.find(".folder-arrow").addClass("expanded")
                        } else {
                            e.removeClass("displayed").addClass("hide-this");
                            c.find(".folder-arrow").removeClass("expanded")
                        }
                        LeftPanel.refreshTotalItemCount();
                        LeftPanel.checkScrollIcons()
                    } else {
                        var m = $("#middle-preview-panel").find(".bg-mask-disabled");
                        m = (m && m.length);
                        if (m) {
                            break
                        }
                        var d = $("#middle-preview-panel").find(".mytv-button");
                        if (d && !d.length) {
                            break
                        }
                        var i = c.data("programId");
                        var a = c.data("eventId");
                        var g = c.data("channelId");
                        if (LeftPanel.datalist) {} else {
                            var h = DataStore.get(Type.Program, i);
                            var l = h && h.parent ? DataStore.get(Type.Program, h.parent) : null;
                            if (l && l != null && l.isGroup == true) {
                                var f = {
                                    eventId: a,
                                    programId: i,
                                    channelId: g,
                                    assetId: c.data("assetId")
                                };
                                f.parentId = h.parent;
                                f.program = h;
                                DataList.setDetails(f, {
                                    programId: i,
                                    assetId: c.data("assetId"),
                                    eventId: a
                                });
                                View.changeView(DataList);
                                return true
                            }
                        }
                        if (i) {
                            var f = {
                                eventId: a,
                                programId: i,
                                channelId: g
                            };
                            var b = LeftPanel.mytv ? Mytv : DataList;
                            b.focusInfo = f;
                            DataSheet.setDetails(i, a, g, c.data("assetId"));
                            View.changeView(DataSheet)
                        }
                    }
                } else {
                    LeftPanel.applyFilter()
                }
                return true;
                break
        }
        return false
    }
};
var GridPanel = {
    row: 0,
    item: [0, 0],
    visibleRow: 0,
    visibleItem: [0, 0],
    focusedRow: [0, 1],
    footerLoaded: false,
    setFocus: function() {
        GridPanel.footerLoaded = false;
        if (View.actualFocus === "grid-panel-right") {
            return
        }
        if ($("#grid-item-" + GridPanel.row + "-" + GridPanel.item[GridPanel.row]).length) {
            Commons.offFocus(View.actualFocus);
            Commons.offHover(View.actualHover);
            $(".grid-row").removeClass("active");
            Commons.setFocus("grid-panel-right");
            $("#grid-row" + GridPanel.row).addClass("active");
            Commons.setHover("grid-item-" + GridPanel.row + "-" + GridPanel.item[GridPanel.row]);
            GridPanel.loadFooter();
            GridPanel.checkImages()
        } else {
            Header.setFocus()
        }
    },
    reset: function() {
        GridPanel.row = 0;
        GridPanel.visibleRow = 0;
        GridPanel.item = [0, 0];
        GridPanel.visibleItem = [0, 0];
        GridPanel.focusedRow = [0, 1];
        GridPanel.footerLoaded = false;
        $("#grid-row" + GridPanel.row + " ul").css("left", 0);
        $("#scroll-grid-container").css("top", 0)
    },
    hideMe: function(a) {
        if (a) {
            $("#grid-panel-right").addClass("hide-this");
            Commons.offFocus(View.actualFocus);
            Commons.offHover(View.actualHover)
        } else {
            $("#grid-panel-right").removeClass("hide-this")
        }
    },
    scrollTop: function(a) {
        Commons.scrollBySize(a, {
            list: "#scroll-grid-container",
            listItem: ".grid-row",
            itemMove: "#scroll-grid-container",
            displayItems: 2,
            movement: "top",
            offset: 0
        }, 1, 298)
    },
    scrollLeft: function(a) {
        Commons.scroll(a, {
            list: "#grid-row-series" + GridPanel.row,
            listItem: "li",
            itemMove: "#grid-row-series" + GridPanel.row,
            displayItems: 6,
            movement: "left",
            offset: 0
        }, 1)
    },
    up: function(c) {
        if (typeof c == "undefined") {
            c = false
        }
        var a = GridPanel.row - 1;
        GridPanel.visibleRow = GridPanel.visibleRow - 1;
        if (GridPanel.visibleRow <= 0) {
            GridPanel.visibleRow = 0;
            GridPanel.scrollTop(-1)
        }
        if (a >= 0) {
            Commons.offHover("grid-item-" + GridPanel.row + "-" + GridPanel.item[GridPanel.row]);
            $("#grid-row" + GridPanel.row + " ul").css("left", 0);
            $("#grid-row" + GridPanel.row).removeClass("active");
            GridPanel.row = a;
            $("#grid-row" + a).addClass("active");
            GridPanel.item[GridPanel.row] = 0;
            GridPanel.visibleItem[GridPanel.row] = 0;
            Commons.setHover("grid-item-" + GridPanel.row + "-" + GridPanel.item[GridPanel.row])
        } else {
            Commons.offHover("grid-item-" + GridPanel.row + "-" + GridPanel.item[GridPanel.row]);
            $("#grid-row" + GridPanel.row).removeClass("active");
            GridPanel.row = 0;
            GridPanel.item[GridPanel.row] = 0;
            GridPanel.visibleItem[GridPanel.row] = 0;
            $("#grid-row" + GridPanel.row + " ul").css("left", 0);
            Header.setFocus()
        }
        TVA.putInnerHTML(document.getElementById("channel_current_item" + GridPanel.row), GridPanel.item[GridPanel.row] + 1);
        var d = $("#" + View.actualHover);
        if (View.actualHover.indexOf("grid-item-") == 0 && d.length) {
            var b = $("#grid-panel-right");
            if (b.length && d.offset().top < 0) {
                GridPanel.scrollTop(-1)
            }
            if (c == true) {
                GridPanel.checkImages()
            }
        }
    },
    down: function(d) {
        if (typeof d == "undefined") {
            d = false
        }
        var b = GridPanel.row + 1;
        var a = $(".grid-row").length - 1;
        GridPanel.visibleRow = GridPanel.visibleRow + 1;
        if (GridPanel.visibleRow >= 2) {
            GridPanel.visibleRow = 2;
            GridPanel.scrollTop(1)
        }
        if (b <= a) {
            Commons.offHover("grid-item-" + GridPanel.row + "-" + GridPanel.item[GridPanel.row]);
            $("#grid-row" + GridPanel.row + " ul").css("left", 0);
            $("#grid-row" + GridPanel.row).removeClass("active");
            GridPanel.row = b;
            $("#grid-row" + b).addClass("active");
            GridPanel.item[GridPanel.row] = 0;
            GridPanel.visibleItem[GridPanel.row] = 0;
            Commons.setHover("grid-item-" + GridPanel.row + "-" + GridPanel.item[GridPanel.row]);
            TVA.putInnerHTML(document.getElementById("channel_current_item" + GridPanel.row), GridPanel.item[GridPanel.row] + 1)
        }
        var e = $("#" + View.actualHover);
        if (View.actualHover.indexOf("grid-item-") == 0 && e.length) {
            var c = $("#grid-panel-right");
            if (c.length && e.offset().top > c.height()) {
                GridPanel.scrollTop(1)
            }
            if (d == true) {
                GridPanel.checkImages()
            }
        }
    },
    checkImages: function(l) {
        if (typeof l === "undefined") {
            l = true
        }
        if (l === true) {
            var c = GridPanel.row;
            var b = c + 1;
            var n = $("#grid-panel-right");
            var p = $("#grid-row" + GridPanel.row);
            if (p.offset().top - n.offset().top >= p.height()) {
                b = GridPanel.row;
                c = b - 1;
                if (c < 0) {
                    c = 0;
                    b = 1
                }
            }
            GridPanel.focusedRow = [c, b]
        } else {
            c = GridPanel.focusedRow[0];
            b = GridPanel.focusedRow[1]
        }
        var m;
        for (m = c - 1; m <= b + 1; m++) {
            if (m < 0 || !Storefront.args.param1.hasOwnProperty(m) || !Storefront.args) {
                continue
            }
            if (Storefront.args.param1[m]["id"] !== "") {
                API.getStorefrontContent(Storefront.mode, Storefront.args.htmlIndex, Storefront.args.param1[m]["id"], m, Storefront.args.arg, function() {
                    GridPanel.checkImages(true);
                    if (View.actualFocus === "grid-panel-right") {
                        var e = View.actualFocus;
                        View.actualFocus = "";
                        GridPanel.setFocus();
                        View.actualFocus = e
                    }
                });
                Storefront.args.param1[m]["id"] = ""
            }
        }
        var h = $(".grid-row");
        var a = [0, 0];
        var k = 0;
        for (m = c; m <= b; m++) {
            var q = $("#grid-row-series" + m);
            var f = q.find(".storefront-img-slider");
            var g = 0;
            try {
                g = $(f.get(0)).parent().parent().position().left
            } catch (o) {
                g = 0
            }
            var d = q.parent().width();
            f.each(function(j, t) {
                var s = ($(this).parent().position().left + g);
                if (s >= 0 && s < d) {
                    var r = $(t).data("coverurl");
                    if (typeof r == "string" && r != "" && r != "undefined") {
                        $(t).data("coverurl", "").load(function(u) {
                            if (TVA.OTT.DEVICETYPE == TVA.OTT.DEVICETYPE_BRAVIA) {
                                try {
                                    var v = $(u);
                                    if (!v.hasClass("invalidate")) {
                                        v.addClass("invalidate")
                                    }
                                } catch (i) {}
                            }
                        }).attr("src", r)
                    }
                }
            });
            if (TVA.OTT.DEVICETYPE == TVA.OTT.DEVICETYPE_BRAVIA) {
                try {
                    a[k] = $(h[m]);
                    if (!a[k].hasClass("invalidate")) {
                        a[k].addClass("invalidate")
                    }
                } catch (o) {}
            }
            k++
        }
        if (TVA.OTT.DEVICETYPE == TVA.OTT.DEVICETYPE_BRAVIA) {
            setTimeout(function() {
                for (var j = 0; j <= 1; j++) {
                    try {
                        if (a[j].hasClass("invalidate")) {
                            a[j].removeClass("invalidate")
                        }
                    } catch (r) {}
                }
            }, 800)
        }
    },
    left: function(b) {
        GridPanel.getVisibleItem();
        var a = GridPanel.item[GridPanel.row] - 1;
        GridPanel.visibleItem[GridPanel.row] = GridPanel.visibleItem[GridPanel.row] - 1;
        if ((GridPanel.visibleItem[GridPanel.row] < 2) && (a >= 2)) {
            GridPanel.visibleItem[GridPanel.row] = 2;
            GridPanel.scrollLeft(-1)
        }
        if (a >= 0) {
            GridPanel.item[GridPanel.row] = a;
            Commons.setHover("grid-item-" + GridPanel.row + "-" + GridPanel.item[GridPanel.row])
        } else {
            Commons.offHover("grid-item-" + GridPanel.row + "-" + GridPanel.item[GridPanel.row]);
            if (!b) {
                $("#grid-row" + GridPanel.row).removeClass("active")
            }
            Commons.scrollIni({
                list: "#grid-row" + GridPanel.row + " ul",
                movement: "left",
                offset: 0
            });
            GridPanel.item[GridPanel.row] = 0;
            GridPanel.visibleItem[GridPanel.row] = 0;
            if (!b) {
                LeftPanel.setFocus()
            } else {
                GridPanel.hoverTo(GridPanel.row, 0)
            }
        }
        TVA.putInnerHTML(document.getElementById("channel_current_item" + GridPanel.row), GridPanel.item[GridPanel.row] + 1);
        if (GridPanel.visibleItem[GridPanel.row] < 0 || GridPanel.item[GridPanel.row] < 0) {
            GridPanel.visibleItem[GridPanel.row] = 0;
            GridPanel.item[GridPanel.row] = 0
        }
        GridPanel.checkImages(false)
    },
    right: function(c) {
        var b = GridPanel.getVisibleItem();
        var a = GridPanel.item[GridPanel.row] + 1;
        var d = $("#grid-row" + GridPanel.row + " li").length - 1;
        if (a > d) {
            if (c) {
                Commons.setHover("grid-item-" + GridPanel.row + "-" + GridPanel.item[GridPanel.row])
            }
            return
        }
        GridPanel.visibleItem[GridPanel.row] = GridPanel.visibleItem[GridPanel.row] + 1;
        if ((GridPanel.visibleItem[GridPanel.row] > 3) && (GridPanel.item[GridPanel.row] <= (d - 3))) {
            GridPanel.visibleItem[GridPanel.row] = 3;
            GridPanel.scrollLeft(1)
        } else {
            if (GridPanel.visibleItem[GridPanel.row] >= 5 && GridPanel.item[GridPanel.row] < b) {
                GridPanel.scrollLeft(1)
            }
        }
        if (a <= d) {
            GridPanel.item[GridPanel.row] = a
        } else {
            Commons.scrollIni({
                list: "#grid-row" + GridPanel.row + " ul",
                movement: "left",
                offset: 0
            });
            GridPanel.item[GridPanel.row] = 0;
            GridPanel.visibleItem[GridPanel.row] = 0
        }
        Commons.setHover("grid-item-" + GridPanel.row + "-" + GridPanel.item[GridPanel.row]);
        TVA.putInnerHTML(document.getElementById("channel_current_item" + GridPanel.row), GridPanel.item[GridPanel.row] + 1);
        GridPanel.checkImages(false)
    },
    getPlayableAssetId: function(a) {
        if (typeof a === "undefined") {
            a = $("#grid-item-" + GridPanel.row + "-" + GridPanel.item[GridPanel.row])
        }
        try {
            if (a.data("assetMatchesProgram") == "1") {
                var c = a.data("assetId");
                if (!c || c == "undefined") {
                    c = Utils.findAsset(a.data("programId"), a.data("eventId"))
                }
                return c
            }
        } catch (b) {}
        return false
    },
    moreInfo: function(c) {
        try {
            View.actualPage.moreInfo()
        } catch (h) {}
        var d = $("#grid-item-" + GridPanel.row + "-" + GridPanel.item[GridPanel.row]);
        var f = {
            programId: d.data("programId"),
            eventId: d.data("eventId"),
            channelId: d.data("channelId")
        };
        if (c === TVA.tvKey.KEY_ENTER) {
            var g = GridPanel.getPlayableAssetId(d);
            if (g !== false) {
                var b = {
                    programId: d.data("programId"),
                    eventId: d.data("eventId"),
                    assetId: g
                };
                b.isLive = false;
                VideoPlayer.setDetails("datasheet", b);
                View.changeView(VideoPlayer);
                return
            }
            var a = DataStore.get(Type.Program, d.data("programId"));
            if (a && a.isGroup === true) {
                f.parentId = d.data("programId");
                f.program = a;
                DataList.setDetails(f, {
                    programId: d.data("programId"),
                    assetId: d.data("assetId"),
                    eventId: d.data("eventId")
                });
                View.changeView(DataList);
                return
            } else {
                GridPanel.recordCurrent();
                return
            }
        }
        var a = DataStore.get(Type.Program, d.data("programId"));
        if (a && a.isGroup === true) {
            f.parentId = d.data("programId");
            f.program = a;
            DataList.setDetails(f, {
                programId: d.data("programId"),
                assetId: d.data("assetId"),
                eventId: d.data("eventId")
            });
            View.changeView(DataList);
            return
        }
        DataSheet.setDetails(f.programId, f.eventId, f.channelId, GridPanel.getPlayableAssetId(d));
        View.changeView(DataSheet)
    },
    recordCurrent: function() {
        GridPanel.recordingChapter(false)
    },
    recordingChapter: function(a) {
        var c = $("#grid-item-" + GridPanel.row + "-" + GridPanel.item[GridPanel.row]);
        var b = {
            programId: c.data("programId"),
            eventId: c.data("eventId"),
            assetId: c.data("assetId"),
            channelId: c.data("channelId")
        };
        if (b.eventId) {
            API.addMyTVItem("recording", b.eventId, "", a)
        } else {
            API.addMyTVItem("program-recording", b.programId, b.channelId)
        }
    },
    checkFooter: function() {
        this.loadFooter();
        var c = View.actualFocus === "header" ? false : GridPanel.getPlayableAssetId();
        if (c) {
            $(".centerFooterButton-" + TVA.tvKey.KEY_ENTER).removeClass("disabled");
            $(".centerFooterButton-" + TVA.tvKey.KEY_RED).addClass("disabled")
        } else {
            $(".centerFooterButton-" + TVA.tvKey.KEY_ENTER).addClass("disabled");
            var b = $("#grid-item-" + GridPanel.row + "-" + GridPanel.item[GridPanel.row]);
            var a = DataStore.get(Type.Program, b.data("programId"));
            if (a && a.isGroup === true) {
                $(".centerFooterButton-" + TVA.tvKey.KEY_RED).addClass("disabled")
            } else {
                $(".centerFooterButton-" + TVA.tvKey.KEY_RED).removeClass("disabled")
            }
        }
    },
    loadFooter: function() {
        if (GridPanel.footerLoaded) {
            return
        }
        var a = [];
        a.push({
            text: "Ver",
            className: "enter-button-footer",
            disabled: true,
            keycode: TVA.tvKey.KEY_ENTER,
            method: function() {
                if (View.actualFocus === "header") {
                    return true
                }
                GridPanel.moreInfo(TVA.tvKey.KEY_ENTER)
            }
        });
        a.push({
            text: "Ficha",
            className: "one-button-footer",
            keycode: TVA.tvKey.KEY_1,
            method: function() {
                GridPanel.moreInfo();
                return false
            }
        });
        a.push({
            text: "Grabar",
            className: "red-button-footer",
            disabled: true,
            keycode: TVA.tvKey.KEY_RED,
            method: function() {
                GridPanel.recordCurrent();
                return false
            }
        });
        Footer.setCenter(a);
        Footer.enableCenter();
        GridPanel.footerLoaded = true;
        GridPanel.checkFooter()
    },
    unloadFooter: function() {
        var a = [];
        Footer.setCenter(a);
        Footer.disableCenter()
    },
    hoverTo: function(b, a) {
        GridPanel.row = b;
        GridPanel.item[GridPanel.row] = a;
        Commons.setHover("grid-item-" + GridPanel.row + "-" + GridPanel.item[GridPanel.row]);
        TVA.putInnerHTML(document.getElementById("channel_current_item" + GridPanel.row), GridPanel.item[GridPanel.row] + 1);
        GridPanel.checkFooter()
    },
    getVisibleItem: function() {
        var a = $("#grid-row-series" + GridPanel.row);
        var d = a.position().left;
        var b = null;
        a.find("li").each(function() {
            var e = d + $(this).position().left;
            if (e >= 0 && !b) {
                b = $(this)
            }
        });
        if (b) {
            var c = parseInt(b.attr("id").split("-")[3]);
            if (isNaN(c)) {
                c = 0
            }
            d = (GridPanel.item[GridPanel.row] - c);
            GridPanel.visibleItem[GridPanel.row] = d;
            return (c) + 6
        }
        return -1
    },
    keyHandler: function(a) {
        switch (a) {
            case TVA.tvKey.KEY_UP:
                GridPanel.up(true);
                GridPanel.checkFooter();
                break;
            case TVA.tvKey.KEY_RIGHT:
                GridPanel.right();
                GridPanel.checkFooter();
                break;
            case TVA.tvKey.KEY_DOWN:
                GridPanel.down(true);
                GridPanel.checkFooter();
                break;
            case TVA.tvKey.KEY_LEFT:
                GridPanel.left();
                GridPanel.checkFooter();
                break;
            case TVA.tvKey.KEY_ENTER:
                GridPanel.moreInfo(TVA.tvKey.KEY_ENTER);
                break
        }
    },
    setHover: function(b, a) {
        GridPanel.row = a;
        Commons.setHover(b);
        GridPanel.checkFooter()
    },
    offHover: function(a) {
        Commons.offHover(a)
    }
};
var MidPanel = {
    setFocus: function() {
        Commons.offFocus(View.actualFocus);
        Commons.offHover(View.actualHover);
        Commons.setFocus("middle-preview-panel");
        MidPanel.hideMe(false)
    },
    hideMe: function(a) {
        if (a) {
            $("#middle-preview-panel").addClass("hide-this");
            Commons.offFocus(View.actualFocus);
            Commons.offHover(View.actualHover)
        } else {
            $("#middle-preview-panel").removeClass("hide-this")
        }
    }
};
var ProgramGrid = {
    actualChannel: 0,
    itemRow: 0,
    visibleChannels: 0,
    detailsTimeout: null,
    firstAccess: true,
    navigatingToLeft: false,
    navigatingToRight: false,
    minY: 0,
    maxY: 0,
    init: function() {
        ProgramGrid.actualChannel = 0;
        ProgramGrid.itemRow = 0;
        ProgramGrid.visibleChannels = 0;
        ProgramGrid.firstAccess = true;
        ProgramGrid.navigatingToLeft = false;
        ProgramGrid.navigatingToRight = false;
        $(".epg .grid-horizontal-scroll").css("left", 0)
    },
    checkMinMax: function() {
        if (ProgramGrid.minY == 0 || ProgramGrid.maxY == 0) {
            var a = $(".bottom-panel-bottom");
            ProgramGrid.minY = a.offset().top;
            ProgramGrid.maxY = ProgramGrid.minY + a.height()
        }
    },
    setFocus: function() {
        Commons.offFocus(View.actualFocus);
        Commons.offHover(View.actualHover);
        Commons.setFocus("epg");
        ProgramGrid.hideMe(false);
        var b = false;
        var a = new Date(TVA.getEpoch());
        if (this.firstAccess) {
            $(".epg-line").css("left", ((a.getHours() * 60 + a.getMinutes()) * 4) - 8).show();
            if (ProgramGrid.setOnTime(a, a)) {
                Commons.setHover("channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
                ProgramGrid.getProgramDetails(true);
                b = true
            }
        } else {
            if (EPG.currentDayOffset != 0) {
                $(".epg-line").hide()
            } else {
                $(".epg-line").css("left", ((a.getHours() * 60 + a.getMinutes()) * 4) - 8).show()
            }
            if (this.navigatingToLeft) {
                a.setDate(a.getDate() + EPG.currentDayOffset);
                a.setHours(23);
                a.setMinutes(59);
                a.setSeconds(0, 0);
                if (ProgramGrid.setOnTime(a, a)) {
                    Commons.setHover("channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
                    ProgramGrid.getProgramDetails(true);
                    b = true
                }
            } else {
                if (this.navigatingToRight) {
                    a.setDate(a.getDate() + EPG.currentDayOffset);
                    a.setHours(0);
                    a.setMinutes(0);
                    a.setSeconds(0, 0);
                    if (ProgramGrid.setOnTime(a, a)) {
                        Commons.setHover("channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
                        ProgramGrid.getProgramDetails(true);
                        b = true
                    }
                } else {
                    Commons.setHover("channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
                    b = true
                }
            }
        }
        if (b == false) {
            ProgramGrid.checkFocus(true)
        }
        ProgramGrid.scrollLeft(0);
        Footer.enableLeft()
    },
    hideMe: function(a) {
        if (a) {
            $("#epg").addClass("hide-this");
            Commons.offFocus(View.actualFocus);
            Commons.offHover(View.actualHover)
        } else {
            $("#epg").removeClass("hide-this")
        }
    },
    scrollTop: function(a) {
        Commons.scroll(a, {
            list: "#channel-vertical-scroll",
            listItem: ".epg-channel",
            itemMove: ".grid-vertical-scroll",
            displayItems: 6,
            movement: "top",
            offset: 0
        }, 1)
    },
    scrollLeft: function(r) {
        var n = $(".epg");
        var b = $("#channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
        var u = n.find(".grid-horizontal-scroll");
        var k = parseInt(b.css("left"));
        var p = parseInt(b.css("width"));
        var i = $(".epg-rows-wrapper");
        var j = i.width();
        if (p > j) {
            p = j
        } else {
            if (p < 0) {
                p = 10
            }
        }
        var e = parseInt(u.css("left"));
        var v = 0;
        if (this.firstAccess) {
            var g = Math.round(j / 40);
            u.css("left", -(k - g));
            this.firstAccess = false
        } else {
            if (this.navigatingToLeft || this.navigatingToRight) {
                var s = parseInt(b.data("posCenter"));
                var d = j / 2;
                var o = s - d;
                if (o < 0) {
                    o = 0
                }
                n.find(".grid-horizontal-scroll").css("left", -o)
            } else {
                newposition = e;
                if (r == -1) {
                    if (k + e < 0) {
                        newposition = -(k - j + p);
                        e = newposition
                    }
                } else {
                    if (r == 1) {
                        v = (k + p) + newposition - j;
                        if (v > 0) {
                            newposition = -k;
                            e = newposition
                        }
                    }
                }
                if (k < Math.abs(e)) {
                    if (e + j < 0) {
                        newposition = -k
                    }
                } else {
                    v = (k + p) + e - j;
                    if (v > 0) {
                        newposition = e - v
                    }
                }
                v = (k + p) + newposition - j;
                if (v > 0) {
                    newposition = e - v
                }
                if (v + j < 0 && r != -1) {
                    newposition -= (v + j);
                    if (p > j) {
                        p = j
                    }
                    newposition += p
                }
                u.css("left", newposition)
            }
        }
        e = parseInt(u.css("left"));
        if (e > 0) {
            u.css("left", 0)
        } else {
            var a = i.offset().left;
            var l = i.offset().left + i.width();
            var q = $("#channelId" + ProgramGrid.actualChannel + " div:last");
            if (q && q.length) {
                var c = q.offset().left + q.width();
                if (l > c && c > a) {
                    var w = l - c;
                    u.css("left", e + w)
                }
            }
        }
        if (EPG.currentDayOffset != 0) {
            $(".epg-line").hide()
        } else {
            var f = $(".epg-line");
            var m = i.offset().left;
            var h = i.width();
            var t = f.show().offset().left;
            if (m < t && t < m + h) {
                f.show()
            } else {
                f.hide()
            }
        }
    },
    up: function() {
        ProgramGrid.visibleChannels = ProgramGrid.visibleChannels - 1;
        if (ProgramGrid.visibleChannels <= 0) {
            ProgramGrid.visibleChannels = 0;
            ProgramGrid.scrollTop(-1)
        }
        var a = ProgramGrid.actualChannel - 1;
        if (a >= 0) {
            var b = $("#channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
            var c = DataStore.get(Type.Event, b.data("eventId"));
            ProgramGrid.actualChannel = a;
            ProgramGrid.setOnTime(c.startTime, c.endTime);
            Commons.setHover("channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
            ProgramGrid.scrollLeft(0);
            ProgramGrid.getProgramDetails()
        } else {
            Header.setFocus()
        }
    },
    pageDown: function() {
        var f = $("#channel-vertical-scroll");
        var g = f.find(".epg-channel");
        var b = g.length - 1;
        ProgramGrid.visibleChannels = 0;
        if (ProgramGrid.actualChannel + 6 > b) {
            f.css("top", 0);
            $("#epg-list-program").css("top", 0)
        } else {
            for (var e = 0; e < 6; e++) {
                ProgramGrid.scrollTop(1)
            }
        }
        var h = f.position().top;
        var a = null;
        for (var j = 0; j < g.length; j++) {
            a = $(g[j]);
            if (h + a.position().top >= 0) {
                break
            }
        }
        if (a != null) {
            var d = $("#channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
            var c = DataStore.get(Type.Event, d.data("eventId"));
            ProgramGrid.actualChannel = j;
            ProgramGrid.setOnTime(c.startTime, c.endTime);
            Commons.setHover("channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
            ProgramGrid.scrollLeft(0);
            ProgramGrid.getProgramDetails()
        }
    },
    down: function() {
        var b = $("#channel-vertical-scroll").find(".epg-channel").length - 1;
        if (ProgramGrid.actualChannel + 1 <= b) {
            ProgramGrid.visibleChannels = ProgramGrid.visibleChannels + 1;
            if (ProgramGrid.visibleChannels >= 6) {
                ProgramGrid.visibleChannels = 6;
                ProgramGrid.scrollTop(1)
            }
        }
        var a = ProgramGrid.actualChannel + 1;
        if (a <= b) {
            var c = $("#channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
            var d = DataStore.get(Type.Event, c.data("eventId"));
            ProgramGrid.actualChannel = a;
            ProgramGrid.setOnTime(d.startTime, d.endTime);
            Commons.setHover("channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
            ProgramGrid.scrollLeft(0);
            ProgramGrid.getProgramDetails()
        }
    },
    left: function() {
        var a = ProgramGrid.itemRow - 1;
        if (a >= 0) {
            Commons.offHover("channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
            ProgramGrid.itemRow = a;
            Commons.setHover("channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
            ProgramGrid.scrollLeft(-1);
            ProgramGrid.getProgramDetails();
            this.navigatingToLeft = false;
            this.navigatingToRight = false
        } else {
            this.navigatingToLeft = true;
            this.navigatingToRight = false;
            EPG.previousDay()
        }
    },
    right: function() {
        var b = $("#channelId" + ProgramGrid.actualChannel).find(".epg-item").length - 1;
        var a = ProgramGrid.itemRow + 1;
        if (a <= b) {
            Commons.offHover("channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
            ProgramGrid.itemRow = a;
            Commons.setHover("channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
            ProgramGrid.scrollLeft(+1);
            ProgramGrid.getProgramDetails();
            this.navigatingToLeft = false;
            this.navigatingToRight = false
        } else {
            this.navigatingToLeft = false;
            this.navigatingToRight = true;
            EPG.nextDay()
        }
    },
    setOnTime: function(e, k) {
        var j;
        var h = e.getDate();
        var d = k.getDate();
        var b = e.getTime();
        var f = k.getTime();
        if (h === d) {
            j = ProgramGrid.getMiddleDate(e, k)
        } else {
            var c = new Date(b);
            c.setHours(24, 0, 0);
            j = ProgramGrid.getMiddleDate(e, c)
        }
        var i = null;
        var a = 999999999999999;
        var g = null;
        $("#channelId" + ProgramGrid.actualChannel + " .epg-item").each(function() {
            var l = $(this).data("eventId");
            var m = DataStore.get(Type.Event, l);
            if (!m || !m.startTime || typeof m.startTime == "string") {
                return
            }
            if (m.startTime.getTime() <= b && m.endTime.getTime() >= f) {
                g = $(this).data("index")
            }
            var o = ProgramGrid.getMiddleDate(m.startTime, m.endTime);
            if (o.getDate() == j.getDate()) {
                var n = Utils.getSecondsBetweenDates(o, j);
                if (n < a) {
                    a = n;
                    i = $(this).data("index")
                }
            }
        });
        if (g !== null) {
            ProgramGrid.itemRow = parseInt(g);
            return true
        } else {
            if (i !== null) {
                ProgramGrid.itemRow = parseInt(i);
                return true
            }
        }
        return false
    },
    getMiddleDate: function(d, c) {
        var b = d.getTime();
        var a = c.getTime();
        return new Date(b + (a - b) / 2)
    },
    getProgramDetails: function(b) {
        var c = $("#channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
        var d = c.data("eventId");
        if (d) {
            TVA.putInnerHTML(document.getElementById("epg-info"), "");
            $(".bg-image").attr("src", "resource/pixel.gif");
            if (b) {
                API.getDetails("event", d)
            } else {
                window.clearTimeout(ProgramGrid.detailsTimeout);
                ProgramGrid.detailsTimeout = window.setTimeout(function() {
                    API.getDetails("event", d)
                }, 1000)
            }
        }
        var e = DataStore.get(Type.Event, d);
        if (Footer.leftMethods.hasOwnProperty(TVA.tvKey.KEY_ENTER)) {
            var a = Utils.now();
            var f = 5 * 60 * 1000;
            if ((c.data("assetId") && c.data("programId") && c.data("channelId")) || (e.startTime.getTime() - f <= a && a <= e.endTime.getTime() + f)) {
                $("#epg-ver-div").removeClass("hide-this");
                $(".leftFooterButton-" + TVA.tvKey.KEY_ENTER).removeClass("disabled")
            } else {
                $("#epg-ver-div").addClass("hide-this");
                $(".leftFooterButton-" + TVA.tvKey.KEY_ENTER).addClass("disabled")
            }
        }
    },
    keyHandler: function(a) {
        var b = false;
        switch (a) {
            case TVA.tvKey.KEY_PLAY:
                if ($(".leftFooterButton-" + TVA.tvKey.KEY_ENTER).hasClass("disabled") == false) {
                    Footer.keyHandler(TVA.tvKey.KEY_ENTER)
                } else {
                    API.getChannels("direct", ProgramGrid.actualChannel)
                }
                break;
            case TVA.tvKey.KEY_UP:
                ProgramGrid.up();
                b = true;
                break;
            case TVA.tvKey.KEY_DOWN:
                ProgramGrid.down();
                b = true;
                break;
            case TVA.tvKey.KEY_RIGHT:
                ProgramGrid.right();
                break;
            case TVA.tvKey.KEY_LEFT:
                ProgramGrid.left();
                break;
            case TVA.tvKey.KEY_ENTER:
                EPG.goDataSheet();
                break
        }
        if (b) {
            ProgramGrid.checkFocus(false)
        }
    },
    setHover: function(b, a) {
        var c = (ProgramGrid.actualChannel != b || ProgramGrid.itemRow != a);
        ProgramGrid.actualChannel = b;
        ProgramGrid.itemRow = a;
        Commons.setHover("channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
        if (c) {
            ProgramGrid.getProgramDetails()
        }
    },
    checkFocus: function(i) {
        if (i == false) {
            if (View.actualHover && $("#" + View.actualHover).length == 0) {
                i = true
            }
        }
        var e = $("#channel-vertical-scroll");
        var g = e.position().top;
        if (i == false) {
            ProgramGrid.checkMinMax();
            var d = $("#" + View.actualHover).offset().top;
            if (d < ProgramGrid.minY) {
                ProgramGrid.scrollTop(-1)
            } else {
                if (d > ProgramGrid.maxY) {
                    ProgramGrid.scrollTop(+1)
                }
            }
            return
        }
        var f = e.find(".epg-channel");
        var a = null;
        for (var h = 0; h < f.length; h++) {
            a = $(f[h]);
            if (g + a.position().top >= 0) {
                break
            }
        }
        if (a != null) {
            ProgramGrid.actualChannel = h;
            ProgramGrid.itemRow = 0;
            var c = $("#channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
            var b = DataStore.get(Type.Event, c.data("eventId"));
            ProgramGrid.setOnTime(b.startTime, b.endTime);
            Commons.setHover("channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
            ProgramGrid.scrollLeft(0);
            ProgramGrid.getProgramDetails()
        }
    }
};
var PopMsg = {
    loadTimeout: null,
    showErrorCode: false,
    init: function() {
        if (!API.initialized) {
            setTimeout("PopMsg.init();", 1000);
            return
        }
        API.call({
            url: API.base_url + "messages",
            data: {
                deviceType: TVA.OTT.DEVICETYPE
            },
            errorWrapper: false,
            errorCode: -1,
            emptyResponseAllowed: true,
            hideLoader: true,
            success: function(b, a, c) {
                if (c && c.status == 200 && b && b.data) {
                    PopMsg.mapping = b.data
                }
            }
        })
    },
    show: function(a, b, d) {
        if (this.text[b]) {
            var e = PopMsg.getText(b);
            Messenger.notifyPopup(a, b, d, e ? e : "");
            if (b == 29) {
                View.loaderHide();
                if (API.initialized == false) {
                    var c = Utils.now() - API.initializing;
                    if (c < 2000) {
                        if (API.numInitErrors < 8) {
                            clearTimeout(PopMsg.loadTimeout);
                            PopMsg.loadTimeout = setTimeout("API.numInitErrors++;Main.onLoad();", 2 * 1000);
                            return false
                        }
                        API.numInitErrors = 5
                    } else {
                        Main.onLoad();
                        return false
                    }
                }
                PopUp.setCallback(Main.onLoad)
            }
            if (!e || typeof e != "string" || e.length <= 0) {
                View.loaderHide();
                return false
            }
            if (PopMsg.showErrorCode === true && typeof d == "string" && d != "") {
                e += "<br/>[" + d + "]"
            }
            View.changeView(PopUp);
            PopUp.showMe(a, false, e);
            return true
        }
        return false
    },
    showMessage: function(a, b) {
        if (!b || !b.length) {
            View.loaderHide();
            return false
        }
        View.changeView(PopUp);
        PopUp.showMe(a, false, b);
        return true
    },
    text: [],
    getText: function(d) {
        var c = "";
        if (d >= 0 && d <= PopMsg.text.length && PopMsg.text.hasOwnProperty(d)) {
            var a = PopMsg.text[d];
            if (a) {
                if (a.v && typeof a.v === "string") {
                    c = a.v
                }
                if (a.k && typeof a.k === "string" && a.k.length > 0) {
                    var b = a.k;
                    if (PopMsg.mapping.hasOwnProperty(b)) {
                        c = PopMsg.mapping[b]
                    }
                }
            }
        }
        return c
    }
};
PopMsg.mapping = {};
PopMsg.text[0] = {
    k: "ERR_CALL_EVT_PB",
    v: "Ocurrió un error al cargar la información del evento"
};
PopMsg.text[1] = {
    k: "ERR_CALL_CHANNELS_LIVE",
    v: "No hay canales de televisión en directo disponibles"
};
PopMsg.text[2] = {
    k: "ERR_LOAD_CHANNELS",
    v: "Se produjo un error al cargar la lista de canales"
};
PopMsg.text[3] = {
    k: "ERR_LOAD_CHANNELS_LIVE",
    v: "Se produjo un error al cargar la lista de canales en directo"
};
PopMsg.text[4] = {
    k: "ERR_LOAD_EPG",
    v: "Se produjo un error al cargar los eventos de la guía"
};
PopMsg.text[5] = {
    k: "ERR_LOAD_PROMOS",
    v: "Se produjo un error al cargar la lista de promociones"
};
PopMsg.text[6] = {
    k: "ERR_LOAD_NOTED",
    v: "Se produjo un error al cargar la lista de destacados"
};
PopMsg.text[7] = {
    k: "ERR_LOAD_RECOMMENDED",
    v: "Se produjo un error al cargar la lista de recomendados"
};
PopMsg.text[8] = {
    k: "ERR_CALL_EPG",
    v: "Se produjo un error al cargar el evento de la guía"
};
PopMsg.text[9] = {
    k: "ERR_CALL_VOTE",
    v: "Se produjo un error al calificar el evento"
};
PopMsg.text[10] = {
    k: "ERR_RECORDING",
    v: "Se produjo un error durante la grabación del evento"
};
PopMsg.text[11] = {
    k: "ERR_CALL_ADD_RECORDING_SINGLE",
    v: "Elemento duplicado. No se puede volver a agregar a la lista de Grabaciones"
};
PopMsg.text[12] = {
    k: "ERR_CALL_ADD_MYTV_WATCHLATER",
    v: "Elemento duplicado. No se puede volver a agregar a la lista de Ver más tarde"
};
PopMsg.text[13] = {
    k: "ERR_PLAYING_WATCHLATER_EVENT",
    v: "Se produjo un error al ver el evento de la lista de Ver más tarde"
};
PopMsg.text[14] = {
    k: "ERR_CALL_MOSTVIEWED",
    v: "Se produjo un error al cargar la lista de Más vistos"
};
PopMsg.text[15] = {
    k: "ERR_CALL_HIGHESTRATED",
    v: "Se produjo un error al cargar la lista de Mas valorados"
};
PopMsg.text[16] = {
    k: "ERR_CALL_MYTV_RECORDINGS",
    v: "Se produjo un error al cargar la lista de grabaciones"
};
PopMsg.text[17] = {
    k: "ERR_CALL_MYTV_PENDINGRECORDINGS",
    v: "Se produjo un error al cargar la lista de grabaciones pendientes"
};
PopMsg.text[18] = {
    k: "ERR_CALL_MYTV_WATCHLATER",
    v: "Se produjo un error al cargar la lista de Ver más tarde"
};
PopMsg.text[19] = {
    k: "ERR_LOAD_CHANNELS_EVENTS",
    v: "Se produjo un error al cargar los canales con eventos"
};
PopMsg.text[20] = {
    k: "ERR_LOAD_EVENTS",
    v: "Se produjo un error al cargar eventos"
};
PopMsg.text[21] = {
    k: "ERR_LOAD_EVENTS_INFO",
    v: "Se produjo un error al cargar toda la información de eventos"
};
PopMsg.text[22] = {
    k: "ERR_LOAD_CHANNELS_MOVIES",
    v: "Se produjo un error al cargar canales con películas"
};
PopMsg.text[23] = {
    k: "ERR_LOAD_MOVIES",
    v: "Se produjo un error al cargar películas"
};
PopMsg.text[24] = {
    k: "ERR_LOAD_CHANNELCONTENT_OPS",
    v: "Se produjo un error al cargar los filtros"
};
PopMsg.text[25] = {
    k: "ERR_LOAD_FILTERS",
    v: "Se produjo un error al cargar los filtros"
};
PopMsg.text[26] = {
    k: "ERR_LOAD_RELATED",
    v: "Se produjo un error al cargar la lista de los relacionados"
};
PopMsg.text[27] = {
    k: "ERR_LOAD_MOVIES_INFO",
    v: "Se produjo un error al cargar toda la información de películas"
};
PopMsg.text[28] = {
    k: "ERR_LOAD_EVENT_DATA",
    v: "Se produjo un error al cargar los datos de un EVENTO / PROGRAMA"
};
PopMsg.text[29] = {
    k: "ERR_SESSION",
    v: "Error de sesión, pulse OK para recargar"
};
PopMsg.text[30] = {
    k: "ERR_SESSION_NOT_STARTED",
    v: "Usted no ha iniciado sesión"
};
PopMsg.text[31] = {
    k: "ERR_NO_AUTH",
    v: "Usted no está autorizado"
};
PopMsg.text[32] = {
    k: "ERR_LOAD_ADVERTS",
    v: "Se produjo un error al cargar los anuncios"
};
PopMsg.text[33] = {
    k: "ERR_CALL_AUTH_PAIR",
    v: "Se produjo un error durante el emparejamiento de dispositivos"
};
PopMsg.text[34] = {
    k: "ERR_PLAYING",
    v: "Ocurrió un error al reproducir el contenido"
};
PopMsg.text[35] = {
    k: "ERR_NO_LOGIN",
    v: "Usuario no registrado"
};
PopMsg.text[36] = {
    k: "ERR_CALL_MYTV_REMOVERECORDING",
    v: "Se produjo un error mientras se eliminaban grabaciones"
};
PopMsg.text[37] = {
    k: "ERR_CALL_MYTV_CANCELRECORDING",
    v: "Se produjo un error mientras se eliminaban grabaciones pendientes"
};
PopMsg.text[38] = {
    k: "ERR_CALL_MYTV_REMOVEWATCHLATER",
    v: "Se produjo un error mientras se eliminaban eventos de la lista Ver más tarde"
};
PopMsg.text[39] = {
    k: "MSG_EOS",
    v: "Fin de sesión completado con éxito"
};
PopMsg.text[40] = {
    k: "MSG_VOTE_OK",
    v: "La votación se ha realizado con éxito"
};
PopMsg.text[41] = {
    k: "MSG_WATCHLATER_ADDED",
    v: "Se ha añadido el evento a la lista de Ver más tarde"
};
PopMsg.text[42] = {
    k: "MSG_RECORDING_ADDED",
    v: "La petición de grabación se ha realizado con éxito"
};
PopMsg.text[43] = {
    k: "MSG_NO_RECORDINGS",
    v: "No se han encontrado grabaciones"
};
PopMsg.text[44] = {
    k: "MSG_NO_ELEMENTS",
    v: "No se han encontrado elementos"
};
PopMsg.text[45] = {
    k: "ERR_API_CHANNELCONTENT",
    v: "No se han encontrado resultados"
};
PopMsg.text[46] = {
    k: "ERR_API_CHANNELCONTENT_CATEGORIES",
    v: "Se produjo un error al cargar los escaparates"
};
PopMsg.text[47] = {
    k: "ERR_VOD_NOT_AVAILABLE",
    v: "Este contenido todavía no está disponible para este dispositivo"
};
PopMsg.text[48] = {
    k: "ERR_TIME_LIMIT_REACHED",
    v: "Se ha excedido el número de horas de reproducción"
};
PopMsg.text[49] = {
    k: "MSG_RECORDING_SEASON_ADDED",
    v: "La petición de grabación de serie se ha realizado con éxito"
};
PopMsg.text[50] = {
    k: "ERR_CALL_ADD_RECORDING",
    v: "No se puede volver a agregar a la lista o no hay espacio disponible en su cuenta para realizar la grabación"
};
PopMsg.text[51] = {
    k: "ERR_API_TIMEOUT",
    v: "La petición ha caducado, por favor vuelva a intentarlo"
};
PopMsg.text[52] = {
    k: "ERR_CHANNEL_NOT_AVAILABLE",
    v: "El canal #CH# todavía no está disponible para este dispositivo"
};
PopMsg.text[53] = {
    k: "MSG_LIVE_INFO",
    v: "Pulse OK para Lista de Canales<br/>Para cambiar de canal pulse < y >"
};
PopMsg.text[54] = {
    k: "ERR_EMPTY_FIELD",
    v: "Campo #FIELD# vacío"
};
PopMsg.text[55] = {
    k: "ERR_ACCEPT_PPRIV",
    v: "Debes aceptar las condiciones de uso y la política de privacidad"
};
var EVT = {
    lastBeacon: null,
    startTime: null,
    pauseStartTime: null,
    pausedTime: 0,
    beaconInterval: 10000,
    freezeTimeStart: 0,
    currentPbId: null,
    currentAssetId: null,
    lastPosition: 0,
    lastPositionTime: 0,
    samePositionTimeout: 60000,
    stopTimeout: null,
    cleanLastPosition: function() {
        EVT.lastPosition = 0;
        EVT.lastPositionTime = 0
    },
    start: function() {
        EVT.cleanLastPosition();
        if (EVT.startTime === null) {
            EVT.startTime = Utils.now();
            EVT.sendBeacon(0)
        }
    },
    play: function() {
        if (EVT.startTime === null) {
            EVT.start()
        }
        if (EVT.pauseStartTime !== null) {
            var a = Utils.now();
            EVT.pausedTime += a - EVT.pauseStartTime;
            EVT.pauseStartTime = null
        }
        EVT.cleanLastPosition()
    },
    pause: function() {
        if (EVT.pauseStartTime === null) {
            EVT.pauseStartTime = Utils.now()
        }
        EVT.cleanLastPosition()
    },
    stop: function() {
        EVT.lastBeacon = 0;
        EVT.sendBeacon(VideoPlayer.currentSeconds);
        EVT.reset()
    },
    reset: function() {
        EVT.startTime = null;
        EVT.pauseStartTime = null;
        EVT.pausedTime = 0;
        EVT.freezeTimeStart = 0;
        EVT.currentAssetId = null;
        EVT.currentPbId = null;
        clearTimeout(EVT.stopTimeout);
        EVT.stopTimeout = null;
        EVT.cleanLastPosition()
    },
    checkFrozenTime: function() {
        if (EVT.freezeTimeStart > 0) {
            var a = Utils.now() - EVT.freezeTimeStart;
            EVT.freezeTimeStart = 0;
            if (a > 0) {
                EVT.pausedTime += a
            }
        }
    },
    sendBeacon: function(d) {
        var b = Utils.now();
        if (TVA_Player.getState() != TVA_Player.state.paused && EVT.lastBeacon < b - EVT.beaconInterval) {
            if (EVT.currentPbId !== null && EVT.currentAssetId !== null) {
                EVT.checkFrozenTime();
                var c = Math.floor((b - EVT.startTime - EVT.pausedTime) / 1000);
                if (arguments.length !== 1) {
                    d = TVA_Player.time()
                }
                if (EVT.startTime === null) {
                    EVT.startTime = Utils.now()
                }
                if (VideoPlayer.playPbStart <= 0) {
                    VideoPlayer.playPbStart = Utils.now()
                }
                var a = (Utils.now() - VideoPlayer.playPbStart) - EVT.pausedTime;
                if (a < 0) {
                    a = 0
                }
                a = Math.floor(a / 1000);
                API.sendEVT(EVT.currentPbId, EVT.currentAssetId, d, a, TVA_Player.getState() == TVA_Player.state.stopped);
                EVT.lastBeacon = Utils.now();
                if (VideoPlayer.initPlayerResponseVideo && VideoPlayer.initPlayerResponseVideo.remainingTime && VideoPlayer.initPlayerResponseVideo.remainingTime > 0) {
                    EVT.initStopTimer(VideoPlayer.initPlayerResponseVideo.remainingTime);
                    VideoPlayer.initPlayerResponseVideo.remainingTime = 0
                }
                View.updateClock()
            }
        }
    },
    initStopTimer: function(a) {
        a = a + 10;
        var b = a * 1000;
        if (b > 86400000) {
            b = 86400000
        }
        clearTimeout(EVT.stopTimeout);
        EVT.stopTimeout = setTimeout(EVT.stopPlayer, b)
    },
    stopPlayer: function() {
        if (View.actualPageIs(VideoPlayer)) {
            if (View.actualPage === PopUp) {
                PopUp.deInitView()
            }
            View.previousPage();
            PopMsg.show("error", 48)
        }
    }
};
var VideoControls = {
    actualControl: 0,
    totalControls: 0,
    lastButtonPress: null,
    isHidden: true,
    refreshTime: 0,
    speed: 1,
    pendingRefresh: false,
    refreshTimeout: 30000,
    showLiveInfo: false,
    directMode: false,
    setFocus: function() {
        if (View.actualPage !== PopUp) {
            if (VideoControls.directMode == false) {
                Commons.offFocus(View.actualFocus);
                Commons.offHover(View.actualHover);
                Commons.setFocus("player-controls");
                Commons.setHover("player-controls" + VideoControls.actualControl)
            } else {
                if (View.actualFocus === "filter-thumbnail-list-container") {
                    return
                }
                Commons.offFocus(View.actualFocus);
                Commons.offHover(View.actualHover);
                $("#filter-thumbs" + ThumbSliderFilter.activeFilter).addClass("active");
                ThumbSliderFilter.setFocus(false)
            }
        }
        VideoControls.lastButtonPress = Utils.now();
        if (View.actualFocus !== "filter-thumbnail-list-container") {
            Footer.enableLeft()
        } else {
            Footer.disableLeft()
        }
    },
    reset: function() {
        VideoControls.actualControl = 0;
        VideoControls.totalControls = 0;
        VideoControls.pendingRefresh = false;
        VideoControls.showLiveInfo = false;
        VideoControls.directMode = false;
        VideoControls.updateTimer(0, 0);
        $("#small-slider").removeClass("hide-this");
        $("#thumbnail-list").removeClass("hide-this");
        $("#sliders").removeClass("hide-this");
        $("#filter-thumbnail-list-container").removeClass("hide-this");
        $("#main-container").removeClass("main-container-live")
    },
    checkControls: function() {
        var a = Utils.now();
        var b = TVA.OTT.HIDE_CONTROLS_TO;
        if (!VideoControls.isHidden && VideoControls.lastButtonPress + b < a) {
            VideoControls.hideControls()
        } else {
            if (VideoControls.isHidden && VideoControls.lastButtonPress + b > a) {
                VideoControls.showControls()
            }
        }
    },
    popupShowed: false,
    hideControls: function() {
        SidePanel.hideMe(true);
        Header.hideMe(true);
        VideoControls.actualControl = 0;
        if (View.actualPageIs(PopUp) == false) {
            Commons.offFocus(View.actualFocus);
            Commons.offHover(View.actualHover);
            Commons.setFocus("video-player");
            Commons.setHover("video-player")
        }
        $("#liveplayer-details-container").addClass("hide-this");
        var a = $("#footer");
        a.addClass("hide-this");
        $("#mousecatcherTop").removeClass("hide-this");
        $("#mousecatcherBottom").removeClass("hide-this");
        $("#header").unbind("mouseover");
        a.unbind("mouseover");
        VideoControls.isHidden = true;
        if (VideoControls.showLiveInfo === true && API.channelsCallbackMode == "direct-start" && totalChannelStorage.getItem("directstart-popup") !== "HIDE" && VideoControls.popupShowed == false) {
            VideoControls.popupShowed = true
        }
        VideoControls.directMode = false;
        VideoControls.checkMode()
    },
    showControls: function(b, a) {
        VideoControls.showLiveInfo = (b === true);
        VideoControls.directMode = (a === true);
        if (VideoControls.directMode) {
            ThumbSliderFilter.loadTab()
        }
        if (View.actualFocus === "side-panel-container-video") {
            SidePanel.closePanel()
        }
        Header.hideMe(false);
        VideoControls.setFocus();
        $("#liveplayer-details-container").removeClass("hide-this");
        var c = $("#footer");
        c.removeClass("hide-this");
        $("#mousecatcherTop").addClass("hide-this");
        $("#mousecatcherBottom").addClass("hide-this");
        $("#header").mouseover(VideoControls.mouseover);
        c.mouseover(VideoControls.mouseover);
        VideoControls.isHidden = false;
        if (VideoControls.pendingRefresh == true) {
            VideoControls.refreshLiveContent()
        }
        VideoControls.checkMode();
        VideoPlayer.setFooter()
    },
    checkMode: function() {
        VideoControls.hideMe(VideoControls.directMode);
        if (VideoControls.directMode == true) {
            $("#small-slider").removeClass("hide-this");
            $("#thumbnail-list").removeClass("hide-this");
            $("#sliders").removeClass("hide-this");
            $("#filter-thumbnail-list-container").removeClass("hide-this");
            $("#main-container").removeClass("hide-this").addClass("main-container-live");
            ThumbSliderFilter.setFocus()
        } else {
            $("#small-slider").addClass("hide-this");
            $("#thumbnail-list").addClass("hide-this");
            $("#sliders").addClass("hide-this");
            $("#filter-thumbnail-list-container").addClass("hide-this");
            $("#main-container").addClass("hide-this").removeClass("main-container-live")
        }
    },
    visibleControls: function() {
        return (!$("#player-controls").hasClass("hide-this"))
    },
    hideMe: function(a) {
        var c = $("#player-controls");
        if (a) {
            c.addClass("hide-this")
        } else {
            c.removeClass("hide-this")
        }
    },
    next: function() {
        var a = VideoControls.actualControl + 1;
        VideoControls.totalControls = $("#video-container-controls").find(".controls-button:visible").length - 1;
        if (a <= VideoControls.totalControls) {
            VideoControls.actualControl = a;
            Commons.setHover("player-controls" + VideoControls.actualControl)
        }
    },
    previous: function() {
        var a = VideoControls.actualControl - 1;
        if (a >= 0) {
            VideoControls.actualControl = a;
            Commons.setHover("player-controls" + VideoControls.actualControl)
        }
    },
    updateTimer: function(f, e) {
        var g = f;
        if (VideoPlayer.details.isLive) {
            g -= VideoPlayer.currentSecondsOff
        }
        if (TVA_Player.getState() == TVA_Player.state.playing) {
            VideoControls.checkControls();
            var d = (g / e) * 100;
            if (d > 100) {
                d = 100
            } else {
                if (d < 0) {
                    d = 0
                }
            }
            TVA.putInnerHTML(document.getElementById("video-current-time"), Utils.getTimeStr(g));
            $("#elapsed-time").css("width", d + "%");
            VideoControls.updateTotalTimer(e);
            if (TVA.OTT.DEVICETYPE == TVA.OTT.DEVICETYPE_BRAVIA) {
                var c = Footer.element["left-controls"];
                try {
                    c.addClass("opaque099");
                    setTimeout(function() {
                        c.removeClass("opaque099")
                    }, 10)
                } catch (b) {}
            }
            if (VideoPlayer.playPbStart <= 0 && f > 0) {
                VideoPlayer.playPbStart = Utils.now()
            }
        } else {
            if (TVA_Player.getState() == TVA_Player.state.stopped && g == 0 && e == 0) {
                TVA.putInnerHTML(document.getElementById("video-current-time"), Utils.getTimeStr(g));
                $("#elapsed-time").css("width", "0%");
                VideoControls.updateTotalTimer(e)
            }
        }
        EVT.sendBeacon(f);
        var a = $("#player-controls").find(".time");
        if (g == 0 && e == 0) {
            a.hide()
        } else {
            a.show()
        }
        if (VideoPlayer.details.isLive && g > e) {
            VideoControls.refreshLiveContent()
        }
    },
    updateTotalTimer: function(a) {
        if (a <= 0) {
            TVA.putInnerHTML(document.getElementById("video-total-time"), "");
            TVA.putInnerHTML(document.getElementById("video-division"), "&nbsp;");
            TVA.putInnerHTML(document.getElementById("video-current-time"), "")
        } else {
            TVA.putInnerHTML(document.getElementById("video-total-time"), Utils.getTimeStr(a));
            TVA.putInnerHTML(document.getElementById("video-division"), "/")
        }
    },
    refreshLiveContent: function() {
        var a = Utils.now();
        if (VideoControls.refreshTime < a - VideoControls.refreshTimeout) {
            if (VideoControls.isHidden) {
                VideoControls.pendingRefresh = true;
                return
            }
            VideoControls.refreshTime = a;
            API.getCurrentLiveContent(VideoPlayer.details.channelId, true)
        }
    },
    play: function() {
        VideoPlayer.speed = 1;
        if (VideoPlayer.inited) {
            if (TVA_Player.getState() == TVA_Player.state.stopped) {
                VideoPlayer.setSeekTime();
                VideoControls.setFocus();
                TVA_Player.play();
                EVT.play()
            } else {
                if (TVA_Player.getState() == TVA_Player.state.paused) {
                    VideoPlayer.setSeekTime();
                    TVA_Player.pause(false);
                    EVT.play()
                } else {
                    if (TVA_Player.getState() == TVA_Player.state.playing) {
                        if (Subtitles.loaded()) {
                            var c = $("#subtitles");
                            var a = parseInt(c.css("font-size").replace("px", ""));
                            if (!c.data("fsz")) {
                                c.data("fsz", a)
                            }
                            var b = parseInt(c.data("fsz"));
                            a += 2;
                            if (a > b + 10) {
                                a = b - 6
                            }
                            c.css("font-size", a + "px")
                        }
                    }
                }
            }
        }
    },
    checkIfPlayerHasStarted: function(a) {
        if (VideoPlayer.inited && VideoPlayer.initialBufferingComplete) {
            if (a) {
                return (!VideoPlayer.details.isLive && TVA_Player.canSeek)
            } else {
                return VideoPlayer.hasStarted(false)
            }
        }
        return false
    },
    pause: function() {
        VideoPlayer.speed = 1;
        if (VideoControls.checkIfPlayerHasStarted(false)) {
            if (TVA_Player.getState() == TVA_Player.state.playing) {
                VideoPlayer.setSeekTime();
                TVA_Player.pause(true);
                EVT.pause()
            }
        }
    },
    stop: function() {
        VideoPlayer.speed = 1;
        if (VideoPlayer.inited) {
            try {
                switch (oldPlayerState) {
                    case TVA_Player.state.playing:
                    case TVA_Player.state.paused:
                    case TVA_Player.state.buffering:
                    case TVA_Player.state.finished:
                    case TVA_Player.state.connecting:
                        Messenger.videoPlayerStopped();
                        break
                }
            } catch (a) {}
            TVA_Player.stop();
            EVT.stop()
        }
    },
    forward: function() {
        VideoPlayer.speed = 1;
        if (VideoControls.checkIfPlayerHasStarted(true)) {
            VideoPlayer.setSeekTime();
            TVA_Player.forward(VideoControls.getSpoolTime(true))
        }
    },
    fForward: function() {
        if (VideoControls.checkIfPlayerHasStarted(true)) {
            VideoPlayer.setSeekTime();
            TVA_Player.forward(VideoControls.getSpoolTime(false))
        }
        if (VideoPlayer.speed < 2) {
            VideoPlayer.speed++
        }
    },
    rewind: function() {
        VideoPlayer.speed = 1;
        if (VideoControls.checkIfPlayerHasStarted(true)) {
            VideoPlayer.setSeekTime();
            TVA_Player.backward(VideoControls.getSpoolTime(true))
        }
    },
    fRewind: function() {
        if (VideoControls.checkIfPlayerHasStarted(true)) {
            VideoPlayer.setSeekTime();
            TVA_Player.backward(VideoControls.getSpoolTime(false))
        }
        if (VideoPlayer.speed < 2) {
            VideoPlayer.speed++
        }
    },
    getSpoolTime: function(b) {
        var a = 120;
        if (b) {
            a = 60
        } else {
            if (VideoPlayer.speed > 0) {
                if (TVA.device === "lg") {
                    a = a * 2
                } else {
                    a = a * VideoPlayer.speed
                }
            }
        }
        return a
    },
    mouseover: function() {
        VideoControls.lastButtonPress = Utils.now()
    },
    keyHandler: function(a) {
        if (VideoControls.isHidden) {
            switch (a) {
                case TVA.tvKey.KEY_RIGHT:
                    VideoPlayer.channelNext();
                    return;
                case TVA.tvKey.KEY_LEFT:
                    VideoPlayer.channelPrevious();
                    return;
                default:
                    VideoControls.showControls();
                    return
            }
        }
        switch (a) {
            case TVA.tvKey.KEY_RIGHT:
                VideoControls.next();
                break;
            case TVA.tvKey.KEY_LEFT:
                VideoControls.previous();
                break;
            case TVA.tvKey.KEY_ENTER:
                if (VideoControls.actualControl == 0) {
                    if (TVA_Player.getState() == TVA_Player.state.playing) {
                        VideoControls.pause()
                    } else {
                        if (TVA_Player.getState() == TVA_Player.state.paused) {
                            VideoControls.play()
                        }
                    }
                } else {
                    if (VideoControls.actualControl == 1) {
                        View.previousPage()
                    } else {
                        if (VideoControls.actualControl == 2) {
                            VideoControls.fRewind()
                        } else {
                            if (VideoControls.actualControl == 3) {
                                VideoControls.rewind()
                            } else {
                                if (VideoControls.actualControl == 4) {
                                    VideoControls.forward()
                                } else {
                                    if (VideoControls.actualControl == 5) {
                                        VideoControls.fForward()
                                    }
                                }
                            }
                        }
                    }
                }
                break
        }
    }
};
var VideoControlsHack = {
    enabled: false,
    timeout: null,
    enable: function() {
        if (TVA.OTT.VIDEOCONTROLSHACKDISABLED == true) {
            return
        }
        if (VideoControlsHack.enabled) {
            return
        }
        VideoControlsHack.enabled = true;
        window.clearTimeout(VideoControlsHack.timeout);
        VideoControlsHack.tick()
    },
    disable: function() {
        if (TVA.OTT.VIDEOCONTROLSHACKDISABLED == true) {
            return
        }
        VideoControlsHack.enabled = false;
        window.clearTimeout(VideoControlsHack.timeout);
        VideoControlsHack.timeout = null
    },
    tick: function() {
        if (TVA.OTT.VIDEOCONTROLSHACKDISABLED == true) {
            return
        }
        if (VideoControlsHack.enabled) {
            var a = Utils.now();
            var b = Math.floor((a - EVT.startTime - EVT.pausedTime) / 1000);
            try {
                window.clearTimeout(VideoControlsHack.timeout)
            } catch (c) {}
            playHeadChanged(b);
            VideoControlsHack.timeout = window.setTimeout(VideoControlsHack.tick, 1000)
        } else {
            VideoControlsHack.disable()
        }
    }
};
var Scroller = {
    getDivId: function(a, b) {
        if (b[0] == ".") {
            return a + " " + b
        } else {
            if (b[0] == "#") {
                return b
            }
        }
        return a + " ." + b
    },
    down: function(b, g) {
        var a = $(b);
        var e = $(this.getDivId(b, g));
        if (a.length && e.length) {
            var f = e.attr("postop");
            if (typeof f === "undefined" || isNaN(parseInt(f))) {
                f = e.position().top
            } else {
                f = parseInt(f)
            }
            if (isNaN(f)) {
                f = 0
            }
            var c = parseInt(e.css("line-height").replace("px", ""));
            if (isNaN(c) || c < 0) {
                c = 0
            }
            var d = f - (a.height() - c);
            if (d > 0) {
                d = 0
            } else {
                if (e.height() - a.height() < -d) {
                    d = -(e.height() - a.height())
                }
            }
            e.attr("postop", Math.round(d));
            e.css({
                top: Math.round(d) + "px"
            })
        }
    },
    up: function(b, g) {
        var a = $(b);
        var e = $(this.getDivId(b, g));
        if (a.length && e.length) {
            var f = e.attr("postop");
            if (typeof f === "undefined" || isNaN(parseInt(f))) {
                f = e.position().top
            } else {
                f = parseInt(f)
            }
            if (isNaN(f)) {
                f = 0
            }
            var c = parseInt(e.css("line-height").replace("px", ""));
            if (isNaN(c) || c < 0) {
                c = 0
            }
            var d = f + (a.height() - c);
            if (d > 0) {
                d = 0
            } else {
                if (e.height() - a.height() < -d) {
                    d = -(e.height() - a.height())
                }
            }
            e.attr("postop", Math.round(d));
            e.css({
                top: Math.round(d) + "px"
            })
        }
    }
};
var Home = {
    classname: "home",
    initView: function() {
        Header.actualPage = 0;
        TVA.putInnerHTML(document.getElementById("middle-preview-panel"), "");
        $(".header-list li").removeClass("active");
        $("#header" + Header.actualPage).addClass("active");
        if (TVA.device === "ps3" && API.configLoaded == false) {} else {
            if (TVA.device === "ps3") {
                setTimeout("API.getPromotions(0);", 500)
            } else {
                API.getPromotions(0)
            }
        }
        var a = [];
        a.push({
            text: "Ficha",
            className: "one-button-footer",
            keycode: TVA.tvKey.KEY_1,
            method: function() {
                Slider.moreInfo();
                return false
            }
        });
        Footer.setLeft(a);
        ThumbSliderFilter.setOptions((Main.username === "") ? "home-not-logged-in" : "home-logged-in");
        ThumbSliderFilter.hideMe(false);
        ThumbSlider.init({
            thumbListContainer: "thumbnail-list",
            thumbContainer: "preview-list-thumbnail",
            thumbName: "thumb-horizontal"
        });
        ThumbSlider.hideMe(false);
        $("#sliders").removeClass("hide-this").addClass("active");
        $("#big-slider").addClass("big-slider");
        View.loaderHide();
        $("#content-multi-panel").addClass("hide-this");
        $("#multi-panel").addClass("hide-this");
        $("#epg").addClass("hide-this")
    },
    deInitView: function() {
        TVA.putInnerHTML(document.getElementById("slider-container"), "");
        $("#prev-big-slider").addClass("hide-this");
        $("#next-big-slider").addClass("hide-this");
        $("#sliders").addClass("hide-this").removeClass("active");
        $("#big-slider").removeClass("big-slider");
        Slider.hideMe(true);
        ThumbSliderFilter.hideMe(true);
        ThumbSliderFilter.reset();
        ThumbSlider.hideMe(true);
        if (!View.actualPageIs(Home)) {
            ThumbSlider.reset(false)
        }
        SidePanel.hideMe(true);
        SidePanel.reset();
        Commons.offFocus(View.actualFocus);
        Commons.offHover(View.actualHover)
    },
    setFocus: function() {
        Commons.currentSection = this.classname;
        Slider.setFocus()
    },
    promos: null,
    buildPromos: function(k) {
        Home.promos = k;
        if (View.actualPageIs(Home) == false) {
            return
        }
        if (API.configLoaded == false) {
            setTimeout("Home.buildPromos(Home.promos);", 1000);
            return
        }
        var g = "";
        Slider.stopInterval();
        TVA.putInnerHTML(document.getElementById("slider-container"), g);
        $("#big-slider").removeClass("big-slider-starttup");
        for (var e in k) {
            if (k.hasOwnProperty(e)) {
                var o = k[e];
                var a = DataStore.get(Type.Event, o.event);
                var f = DataStore.get(Type.Program, o.program);
                var l = DataStore.get(Type.Channel, a.channel);
                var d = DataStore.get(Type.Asset, o.asset);
                Home.promos[e]["datalist"] = null;
                if (f.parent) {
                    var m = DataStore.get(Type.Program, f.parent);
                    if (m && m.isGroup === true) {
                        Home.promos[e]["datalist"] = {
                            programId: (f ? f.id : ""),
                            eventId: (a ? a.id : ""),
                            channelId: (a.channel && a.channel["id"] ? a.channel["id"] : ""),
                            parentId: (f ? f.parent : ""),
                            program: m,
                            programNode: f,
                            finfo: {
                                programId: (f ? f.id : ""),
                                assetId: (d ? d.id : ""),
                                eventId: (a ? a.id : "")
                            }
                        }
                    }
                }
                var j = "";
                if (e > 0) {
                    j = "hide-this"
                }
                var c = a.startTime;
                var h = a.endTime;
                var b = "&nbsp;";
                if (f.season) {
                    b = " | T" + f.season;
                    if (f.episodePartial) {
                        b += " Ep. " + f.episodePartial
                    }
                }
                g += "<div id='slider" + e + "' class='info-slide " + j + "' data-eventId='" + o.event + "' data-programId='" + o.program + "'>";
                g += "<div class='big-slider-info' onclick='Slider.moreInfo();'>";
                g += "<span class='channel'>" + l.name + "</span>";
                g += "<h1 class='series'>" + f.title + "</h1>";
                g += "<h2 class='chapter'>" + ((f.type === "Serie" && f.episodeTitle) ? f.episodeTitle : "&nbsp;") + "</h2>";
                g += "<h3 class='description'>" + (f.productionYear ? f.productionYear + " - " : "") + f.type + b + "</h3>";
                g += "<h3 class='schedule'>" + Utils.weekday[c.getDay()] + " " + c.getDate() + " de " + Utils.month[c.getMonth()] + "  " + Utils.checkTimeStr(c.getHours()) + ":" + Utils.checkTimeStr(c.getMinutes()) + " - " + Utils.checkTimeStr(h.getHours()) + ":" + Utils.checkTimeStr(h.getMinutes()) + "</h3>";
                g += "</div>";
                g += "<div class='bg-default'></div>";
                if (o.backgroundUrl != null) {
                    var n = "src='" + API.image_base_url + o.backgroundUrl + "'";
                    if (e > 0) {
                        n = "data-" + n + " id='home-promo-" + e + "' src='resource/general/empty.png' onload='$(this).show();' onerror='$(this).hide();' "
                    } else {
                        n += " onload='Home.loadPromoImg(0);$(this).show();' onerror='Home.loadPromoImg(0);$(this).hide();'  "
                    }
                    g += "<img class='bg-image resized' " + n + " alt='' />"
                } else {
                    g += "<img class='bg-image resized' src='resource/general/empty.png' alt='' onload='$(this).show();' onerror='$(this).hide();' />"
                }
                g += "</div>"
            }
        }
        TVA.putInnerHTML(document.getElementById("slider-container"), g);
        Slider.actualSlide = 0;
        Slider.hideMe(false);
        $("#prev-big-slider").removeClass("hide-this");
        $("#next-big-slider").removeClass("hide-this");
        if (View.actualPage !== PopUp && PopUp.isVisible == false) {
            Slider.setFocus()
        }
        Slider.startInterval()
    },
    loadPromoImg: function(g) {
        try {
            var d = [g, (g + 1)];
            if (g - 1 < 0) {
                d.push(($(".info-slide").length - (g + 1)))
            } else {
                d.push(g - 1)
            }
            for (var c = 0; c < d.length; c++) {
                var b = d[c];
                var f = $("#home-promo-" + b);
                if (f.length == 1 && typeof f.data("src") != "undefined" && f.data("src") != "") {
                    var j = f.data("src");
                    f.data("src", "");
                    f.error(function() {
                        $(this).hide()
                    });
                    f.attr("src", j)
                }
            }
            TVA.invalidate()
        } catch (h) {}
    },
    buildStorefronts: function(e) {
        Header.storeFrontLoaded = true;
        var b, c, a = 0;
        var d = 6;
        for (b = 0; b < e.length && b < d; b++) {
            c = document.getElementById("header" + (4 + b));
            TVA.putInnerHTML(c, e[b].name.toUpperCase());
            c.setAttribute("data-page-idx", b);
            c.setAttribute("data-id", e[b].id);
            c.setAttribute("data-name", e[b].name);
            a = 4 + b + 1
        }
        Header.storeFrontCount = e.length;
        for (b = a; b <= 4 + d - 1; b++) {
            Header.removeElement(b)
        }
        Home.alignDivs()
    },
    alignDivs: function() {},
    keyHandler: function(a) {
        if (Main.keyHistoryMatches(Main.SHORTCUT_NO_HW_BLITTING) == true) {
            var b = Utils.setBlitting(true);
            Alert.show(b == "1" ? TVA.OTT.STRINGS.SLOW_DEVICE_ENABLED : TVA.OTT.STRINGS.FAST_DEVICE_ENABLED)
        }
        if (View.actualFocus == "big-slider") {
            Slider.keyHandler(a)
        } else {
            Slider.startInterval();
            if (View.actualFocus == "filter-thumbnail-list-container") {
                ThumbSliderFilter.keyHandler(a)
            } else {
                if (View.actualFocus == "thumbnail-list") {
                    ThumbSlider.keyHandler(a)
                }
            }
        }
    }
};
var DataSheet = {
    classname: "datasheet",
    details: {
        eventId: null,
        programId: null,
        channelId: null
    },
    playEnabled: false,
    recordingEnabled: 0,
    initView: function() {
        TVA.putInnerHTML(document.getElementById("slider-container"), "");
        TVA.putInnerHTML(document.getElementById("middle-preview-panel"), "");
        if (DataSheet.details.eventId) {
            API.getDetails("event", DataSheet.details.eventId)
        } else {
            if (DataSheet.details.channelId) {
                API.getProgramDetails(DataSheet.details.programId, DataSheet.details.channelId)
            } else {
                API.getDetails("program", DataSheet.details.programId)
            }
        }
        View.actualFocus = "thumbnail-list";
        Commons.lastTextScroll = 0;
        $("#sliders").removeClass("hide-this").addClass("active");
        $("#big-slider").addClass("big-slider");
        Slider.hideMe(false);
        ThumbSlider.init({
            thumbListContainer: "thumbnail-list",
            thumbContainer: "preview-list-thumbnail",
            thumbName: "thumb-horizontal"
        });
        ThumbSlider.hideMe(false);
        ThumbSliderFilter.hideMe(false);
        DataSheet.setFocus();
        View.loaderHide();
        DataSheet.dsErrorShowed = 0
    },
    deInitView: function(a) {
        $("#sliders").addClass("hide-this").removeClass("active");
        $("#big-slider").removeClass("big-slider");
        if (typeof a === "undefined" || !a.classname || (a.classname !== "epg" && a.classname !== "datasheet")) {
            EPG.prevFocus = null
        }
        DataStore.cleanRefs();
        Slider.hideMe(true);
        ThumbSliderFilter.hideMe(true);
        ThumbSliderFilter.reset();
        ThumbSlider.hideMe(true);
        ThumbSlider.reset(true);
        SidePanel.hideMe(true);
        SidePanel.reset();
        Commons.offFocus(View.actualFocus);
        Commons.offHover(View.actualHover);
        Footer.setCenter([]);
        DataSheet.dsErrorShowed = 0
    },
    setButtonClick: function() {
        if (View.actualFocus == "filter-thumbnail-list-container") {
            return true
        }
        if (DataSheet.playEnabled) {
            var b = $("#slider" + Slider.actualSlide);
            var a = {
                programId: (b.data("programId") ? b.data("programId") : DataSheet.details.programId),
                eventId: (b.data("eventId") ? b.data("eventId") : DataSheet.details.eventId),
                channelId: (b.data("channelId") ? b.data("channelId") : DataSheet.details.channelId),
                assetId: DataSheet.getAssetId()
            };
            if ((!a.assetId && DataSheet.playEnabled == true && a.channelId) || (a.assetId && DataSheet.details.isLive == true)) {
                API.getChannels("direct", a.channelId)
            } else {
                if (a.assetId) {
                    a.isLive = false;
                    VideoPlayer.setDetails("datasheet", a);
                    View.changeView(VideoPlayer)
                } else {
                    if (DataSheet.dsErrorShowed < 2) {
                        PopMsg.show("error", 34, "DS01");
                        DataSheet.dsErrorShowed++
                    }
                }
            }
        } else {
            if (DataSheet.recordingEnabled > 0) {
                Footer.keyHandler(TVA.tvKey.KEY_RED)
            }
        }
        return false
    },
    setButtonFocus: function() {
        Commons.offFocus(View.actualFocus);
        Commons.setFocus("big-slider");
        Commons.offHover(View.actualHover);
        Commons.setHover("datasheet-verrec-div");
        if (!$("#datasheet-verrec-div").length) {}
    },
    setFocus: function() {
        if (DataSheet.playEnabled || DataSheet.recordingEnabled > 0) {
            DataSheet.setButtonFocus()
        } else {
            ThumbSliderFilter.setFocus();
            Footer.enableLeft()
        }
    },
    setDetails: function(d, a, c, e, b) {
        DataSheet.dsErrorShowed = 0;
        DataSheet.details.programId = d;
        DataSheet.details.eventId = a;
        DataSheet.details.channelId = c;
        DataSheet.details.assetId = e;
        DataSheet.details.isLive = b
    },
    getCastHTMLStrings: function(a) {
        var d = {
            cast: "",
            producer: "",
            creator: ""
        };
        for (var c = 0; c < a.length; c++) {
            var b = DataStore.get(Type.Cast, a[c]);
            var e = b.fullName;
            if (e && typeof e === "string") {
                e = e.replace(/\(([^\)])+\)$/, "");
                switch (b.role) {
                    case 2:
                        d.cast += e + ", ";
                        break;
                    case 6:
                        d.producer += e + ", ";
                        break;
                    case 9:
                        d.creator += e + ", ";
                        break
                }
            }
        }
        d.cast = d.cast.slice(0, -2);
        d.producer = d.producer.slice(0, -2);
        d.creator = d.creator.slice(0, -2);
        return d
    },
    isXXXGroup: function(a, c) {
        var d = parseInt(a.season);
        var b = parseInt(a.episode);
        var e = parseInt(a.episodePartial);
        return (a.type == c) && Utils.isNumber(d) && (d !== 0) && (b === 0) && (e === 0)
    },
    isXXXMaster: function(a, c) {
        var d = parseInt(a.season);
        var b = parseInt(a.episode);
        var e = parseInt(a.episodePartial);
        return (a.type == c) && Utils.isNumber(d) && (d === 0) && (b === 0) && (e === 0)
    },
    isSerieGroup: function(a) {
        return DataSheet.isXXXGroup(a, "Serie")
    },
    isSerieMaster: function(a) {
        return DataSheet.isXXXMaster(a, "Serie")
    },
    haveChapterOrSeason: function(a) {
        var c = parseInt(a.season);
        var b = parseInt(a.episode);
        var d = parseInt(a.episodePartial);
        return (c > 0) || (b > 0) || (d > 0)
    },
    haveMaster: function(a) {
        return (a.master != a.parent)
    },
    build: function(J) {
        var a = DataStore.get(Type.Program, J.program);
        var N = false;
        var D = false;
        var m = false;
        var v = false;
        var r = "";
        var G = "&nbsp;";
        var x = "&nbsp;";
        var L, s;
        if (J.event) {
            N = DataStore.get(Type.Event, J.event);
            D = DataStore.get(Type.Channel, N.channel);
            m = N.startTime;
            v = N.endTime;
            r = J.event;
            x = Utils.weekday[m.getDay()] + " " + m.getDate() + " de " + Utils.month[m.getMonth()] + "  " + Utils.checkTimeStr(m.getHours()) + ":" + Utils.checkTimeStr(m.getMinutes()) + " - " + Utils.checkTimeStr(v.getHours()) + ":" + Utils.checkTimeStr(v.getMinutes())
        } else {
            if (DataSheet.details.channelId) {
                D = DataStore.get(Type.Channel, DataSheet.details.channelId)
            }
        }
        if (D) {
            G = D.name
        }
        var M = "&nbsp;";
        if (a.season) {
            M = " | T" + a.season;
            if (a.episodePartial) {
                M += " Ep. " + a.episodePartial
            }
        }
        var H = new Date().getTime();
        var j = (m && m.getTime() > H);
        var w = (!j && v && v.getTime() >= H);
        var i = 0;
        if (a.usersReview) {
            i = Math.round(a.usersReview)
        }
        var y = DataSheet.isSerieGroup(a);
        var B = DataSheet.isSerieMaster(a);
        var E = DataSheet.haveChapterOrSeason(a);
        var n = DataSheet.haveMaster(a);
        var o = false;
        if (J.asset || DataSheet.details.assetId) {
            o = true
        } else {
            if (y || B) {} else {
                var I = DataSheet.getAssetId();
                if (I) {
                    o = true
                }
            }
        }
        if (w) {
            o = true
        }
        DataSheet.playEnabled = o;
        var O = false;
        if (Main.username !== "") {
            O = true
        }
        var p = 0;
        if (Main.username !== "" && o == false) {
            if (j || w) {
                p = 1
            } else {
                if (DataSheet.details.programId && DataSheet.details.channelId) {
                    p = 2
                }
            }
        }
        DataSheet.recordingEnabled = p;
        var A = "";
        var k = "data-eventId='" + r + "' data-programId='" + J.program + "' data-assetId='" + J.asset + "' data-channelId='" + DataSheet.details.channelId + "'";
        A += "<div id='slider0' class='info-slide' " + k + " >";
        A += "<div class='ficha-gradient-img'>";
        A += "<div class='ficha-gradient-bg'></div>";
        var l = "onerror='$(this).hide();'";
        if (a.backgroundUrl != null) {
            A += "<img class='bg-image resized' " + l + " src='" + API.image_base_url + a.backgroundUrl + "' alt='' />"
        } else {
            A += "<img class='bg-image resized' " + l + " src='resource/general/empty.png' alt='' />"
        }
        A += "</div>";
        A += "<div class='ficha-gradient-mask'></div>";
        A += "<div class='datasheet-info'>";
        var g = parseInt(a.season);
        var q = parseInt(a.episode);
        if (g > 0 && q <= 0) {
            A += "<div class='season-tab' ><div>T" + g + "</div></div>"
        }
        A += "<span class='channel'>" + G + "</span>";
        A += "<h1 class='series'>" + a.title + "</h1>";
        A += "<h2 class='chapter'>" + ((a.episodeTitle) ? a.episodeTitle : "&nbsp;") + "</h2>";
        var c = a.type;
        if (a.genre) {
            c = c + " - " + a.genre
        }
        A += "<h3 class='description'>" + (a.productionYear ? a.productionYear + " - " : "") + c + M + "</h3>";
        A += "<h3 class='schedule'>" + x + "</h3>";
        A += '<h4 class="user-votes">Votos Usuarios<span class="stars stars' + i + '"></span></h4>';
        A += DataSheet.buildIconHTML(a, N, D);
        A += "</div>";
        A += "<div class='datasheet-data'>";
        A += "<div id='datasheet-description-container' class='scroller'>";
        A += "<div id='datasheet-description' class='datasheet-description'>" + a.synopsis + "</div>";
        A += "</div>";
        A += "<div class='datasheet-cast-div' ><ul id='datasheet-cast' class='datasheet-cast'>";
        var u = false;
        if (o) {
            A += "<div id='datasheet-verrec-div' onmouseover='DataSheet.setButtonFocus();' onclick='DataSheet.setButtonClick();' class='datasheet-ver-div' ></div>"
        } else {
            if (p > 0) {
                var d = "";
                u = true;
                if (m && m.getDay) {
                    d = Utils.weekday[m.getDay()] + "<br/>" + m.getDate() + " de " + Utils.month[m.getMonth()] + "<br/>" + Utils.checkTimeStr(m.getHours()) + ":" + Utils.checkTimeStr(m.getMinutes()) + " - " + Utils.checkTimeStr(v.getHours()) + ":" + Utils.checkTimeStr(v.getMinutes())
                }
                A += "<div id='datasheet-verrec-div' onmouseover='DataSheet.setButtonFocus();' onclick='DataSheet.setButtonClick();' class='datasheet-rec-div' ><div class='datasheet-rec-date' >" + d + "</div></div>"
            }
        }
        if (a.cast) {
            var C = DataSheet.getCastHTMLStrings(a.cast);
            if (C.cast) {
                A += "<li><span class='title'>Actores: </span>" + C.cast + "</li>"
            }
            if (C.producer) {
                A += "<li><span class='title'>Productor: </span>" + C.producer + "</li>"
            }
            if (C.creator) {
                A += "<li><span class='title'>Creador: </span>" + C.creator + "</li>"
            }
        }
        if (a.language) {
            var t = DataStore.get(Type.Language, a.language[0]);
            A += "<li><span class='title'>Idioma original: </span>" + t.name + "</li>"
        }
        if (a.productionCountry) {
            var F = DataStore.get(Type.Country, a.productionCountry[0]);
            A += "<li><span class='title'>País: </span>" + F.name + "</li>"
        }
        A += "</ul></div>";
        A += "</div>";
        A += "<div class='clear'></div>";
        A += "</div>";
        TVA.putInnerHTML(document.getElementById("slider-container"), A);
        if (u == true) {
            $(".schedule").addClass("hide-this")
        } else {
            $(".schedule").removeClass("hide-this")
        }
        var z = false;
        if (Main.username !== "" && o) {
            z = true;
            var h = DataStore.get(Type.Asset, DataSheet.getAssetId());
            if (h && h.type !== "Catchup") {
                z = false
            }
        }
        var K = [];
        K.push({
            text: "Ver",
            className: "enter-button-footer",
            disabled: !o,
            keycode: TVA.tvKey.KEY_ENTER,
            method: function() {
                if (View.actualFocus === "header") {
                    return true
                }
                return DataSheet.setButtonClick()
            }
        });
        K.push({
            text: "Grabar",
            className: "red-button-footer",
            disabled: !p,
            keycode: TVA.tvKey.KEY_RED,
            method: function() {
                if (p) {
                    var P = $("#slider" + Slider.actualSlide);
                    if (P.data("eventId") && (a.parent || a.master) && v.getTime() > H) {
                        PopUp.showMe("recording-chapter", false, "");
                        PopUp.setCallback(DataSheet.recordingChapter)
                    } else {
                        if (P.data("eventId") && DataSheet.recordingEnabled == 2) {
                            PopUp.showMe("recording-serie", false, "");
                            PopUp.setCallback(DataSheet.recordingChapter)
                        } else {
                            DataSheet.recordingChapter(false)
                        }
                    }
                }
                return false
            }
        });
        var f, e;
        L = "green-button-footer";
        s = TVA.tvKey.KEY_GREEN;
        if (TVA.device == "ps3") {
            L = "yellow-button-footer";
            s = TVA.tvKey.KEY_YELLOW
        }
        f = {
            text: "Ver + tarde",
            disabled: !z,
            className: L,
            keycode: s,
            method: function() {
                if (z) {
                    var Q = $("#slider" + Slider.actualSlide);
                    var P = {
                        programId: Q.data("programId"),
                        eventId: Q.data("eventId"),
                        assetId: DataSheet.getAssetId()
                    };
                    if (P.assetId) {
                        API.addMyTVItem("watch-later", P.assetId)
                    }
                }
                return false
            }
        };
        L = "blue-button-footer";
        s = TVA.tvKey.KEY_BLUE;
        if (TVA.device == "ps3") {
            L = "green-button-footer";
            s = TVA.tvKey.KEY_GREEN
        }
        e = {
            text: "Votar",
            disabled: !O,
            className: L,
            keycode: s,
            method: function() {
                if (O) {
                    var Q = $("#slider" + Slider.actualSlide).data("programId");
                    if (Q) {
                        var P = DataStore.get(Type.Program, Q);
                        PopUp.setVotingDetails(Q, P.userVote);
                        PopUp.showMe("voting", false, "");
                        View.changeView(PopUp)
                    }
                }
                return false
            }
        };
        if (TVA.device == "ps3") {
            K.push(e);
            K.push(f)
        } else {
            K.push(f);
            K.push(e)
        }
        Footer.setLeft(K);
        Footer.enableLeft();
        if (!DataSheet.details.channelId && D) {
            DataSheet.details.channelId = D.id
        }
        var b = a.parent ? a.parent : a.master;
        if (b && a.parent == a.master && y == true && B == false) {
            b = null
        }
        if (DataSheet.details.eventId) {
            if ((a.type === "Serie" || a.type === "Programa") && b) {
                ThumbSliderFilter.setOptions("datasheet-event-serie");
                API.getSliderContent("catch", b, true)
            } else {
                if (a.type === "Deportes" && b) {
                    ThumbSliderFilter.setOptions("datasheet-event-deportes");
                    API.getSliderContent("catch", b, true)
                } else {
                    ThumbSliderFilter.setOptions("datasheet-event");
                    API.getSliderContent("similar-programs", a.id, false)
                }
            }
            ThumbSliderFilter.hideSeasonsTab(!E || !n)
        } else {
            if (a.isMaster) {
                ThumbSliderFilter.setOptions("datasheet-program-master");
                API.getSliderContent("catch", a.id, a.isMaster);
                ThumbSliderFilter.hideSeasonsTab(!E)
            } else {
                if ((a.type === "Serie" || a.type === "Programa") && (b || y || B)) {
                    ThumbSliderFilter.setOptions("datasheet-program-serie");
                    ThumbSliderFilter.hideSeasonsTab(B || !E);
                    API.getSliderContent("catch", b ? b : a.id, true)
                } else {
                    if (DataSheet.isXXXMaster(a, "Deportes") && a.type === "Deportes") {
                        ThumbSliderFilter.setOptions("datasheet-event-deportes");
                        ThumbSliderFilter.hideSeasonsTab(B || !E);
                        API.getSliderContent("catch", b ? b : a.id, true)
                    } else {
                        ThumbSliderFilter.setOptions("datasheet-program", a.id);
                        API.getSliderContent("similar-programs", a.id, false);
                        ThumbSliderFilter.hideSeasonsTab(!E)
                    }
                }
            }
        }
        DataSheet.setFocus()
    },
    getAssetId: function() {
        var a = $("#slider" + Slider.actualSlide);
        var b = a.data("assetId");
        if (!b || b == "undefined") {
            b = Utils.findAsset(a.data("programId"), a.data("eventId"))
        }
        if (!b || b == "undefined") {
            b = DataSheet.details.assetId
        }
        return b
    },
    buildIconHTML: function(a, d, c) {
        var b = '<div class="item-icons">';
        switch (a.parentalRating) {
            case 7:
                b += '<img src="resource/info-icons/parentalRating-7.png" alt="icons"/>';
                break;
            case 12:
                b += '<img src="resource/info-icons/parentalRating-12.png" alt="icons"/>';
                break;
            case 13:
                b += '<img src="resource/info-icons/parentalRating-13.png" alt="icons"/>';
                break;
            case 16:
                b += '<img src="resource/info-icons/parentalRating-16.png" alt="icons"/>';
                break;
            case 18:
                b += '<img src="resource/info-icons/parentalRating-18.png" alt="icons"/>';
                break;
            case 0:
                b += '<img src="resource/info-icons/parentalRating-todos.png" alt="icons"/>';
                break;
            case 101:
                b += '<img src="resource/info-icons/parentalRating-x.png" alt="icons"/>';
                break;
            case 102:
                b += '<img src="resource/info-icons/parentalRating-infantil-todos.png" alt="icons"/>';
                break
        }
        if (d) {
            if (d.deafSubtitle) {
                b += '<img src="resource/info-icons/deafSubtitle.png" alt="icons"/>'
            }
            if (d.hd) {
                b += '<img src="resource/info-icons/hd.png" alt="icons"/>'
            }
        } else {
            if (c && c.hd === true) {
                b += '<img src="resource/info-icons/hd.png" alt="icons"/>'
            } else {
                b += '<img src="resource/info-icons/sd.png" alt="icons"/>'
            }
        }
        if (d) {
            if (d.repeated) {
                b += '<img src="resource/info-icons/repeated.png" alt="icons"/>'
            }
            if (d.live) {
                b += '<img src="resource/info-icons/live.png" alt="icons"/>'
            }
            if (d.dual) {
                b += '<img src="resource/info-icons/dual.png" alt="icons"/>'
            }
            if (d.blindCommentary) {
                b += '<img src="resource/info-icons/blindCommentary.png" alt="icons"/>'
            }
        }
        b += "</div>";
        return b
    },
    keyHandler: function(b) {
        var c = $("#datasheet-verrec-div");
        if (c.length && c.hasClass("hover") && View.actualFocus !== "big-slider") {
            DataSheet.setButtonFocus();
            View.actualFocus = "big-slider"
        }
        if (View.actualFocus == "big-slider") {
            var a = null;
            if (Main.keyHistoryMatches(Main.SHORTCUT_NO_DRM_1)) {
                a = 1
            } else {
                if (Main.keyHistoryMatches(Main.SHORTCUT_NO_DRM_2)) {
                    a = 2
                } else {
                    if (Main.keyHistoryMatches(Main.SHORTCUT_NO_DRM_DEFAULT)) {
                        a = 0
                    }
                }
            }
            if (Main.switchDRM(a) == true) {
                return
            }
            if (b == TVA.tvKey.KEY_DOWN) {
                ThumbSliderFilter.setFocus();
                Footer.enableLeft()
            } else {
                if (b == TVA.tvKey.KEY_UP) {
                    Header.setFocus();
                    Footer.enableLeft()
                } else {
                    if (b == TVA.tvKey.KEY_ENTER) {
                        DataSheet.setButtonClick()
                    }
                }
            }
        } else {
            if (View.actualFocus == "filter-thumbnail-list-container") {
                if (b == TVA.tvKey.KEY_UP) {
                    if (DataSheet.playEnabled || DataSheet.recordingEnabled > 0) {
                        DataSheet.setFocus()
                    } else {
                        Header.setFocus()
                    }
                    Footer.enableLeft()
                } else {
                    ThumbSliderFilter.keyHandler(b)
                }
            } else {
                if (View.actualFocus == "thumbnail-list") {
                    ThumbSlider.keyHandler(b);
                    if (View.actualFocus == "filter-thumbnail-list-container") {
                        Footer.enableLeft()
                    }
                } else {
                    if (b == TVA.tvKey.KEY_DOWN) {
                        ThumbSliderFilter.setFocus();
                        Footer.enableLeft()
                    }
                }
            }
        }
    },
    recordingChapterFinished: function(a) {
        if (a == false) {
            PopMsg.showMessage("error", PopMsg.getText(10))
        } else {
            DataSheet.recordingChapter(a)
        }
    },
    recordingChapter: function(a) {
        var c = $("#slider" + Slider.actualSlide);
        var b = {
            programId: c.data("programId"),
            eventId: c.data("eventId"),
            assetId: c.data("assetId"),
            channelId: c.data("channelId")
        };
        if (b.eventId && DataSheet.recordingEnabled == 1) {
            API.addMyTVItem("recording", b.eventId, "", a)
        } else {
            if (b.eventId && DataSheet.recordingEnabled == 2) {
                API.addMyTVItem("recording", b.eventId, "", true)
            } else {
                API.addMyTVItem("program-recording", b.programId, b.channelId)
            }
        }
    },
    getExtendedInfo: function(h, B, r, c) {
        var k = "";
        var y = true;
        var v = "";
        var g = true;
        try {
            if (c) {
                var m = c.find(".folder-arrow");
                if (m && m.length && m.is(":visible")) {
                    y = false
                }
                var a = c.data("programId");
                var h = DataStore.get(Type.Program, a);
                var i = h && h.parent ? DataStore.get(Type.Program, h.parent) : null;
                if (i && i != null && i.isGroup == true) {
                    g = false
                }
            }
            if (LeftPanel.mytv && y) {
                var f = DataStore.get(Type.Program, c.data("programId"));
                if (f && f.isGroup == true) {
                    y = false
                } else {
                    if (h && h.isGroup == true) {
                        y = false
                    }
                }
            }
            var d = r ? r.startTime : null;
            var t = r ? r.endTime : null;
            if (d && d.getDay) {
                v = Utils.weekday[d.getDay()] + " " + d.getDate() + " de " + Utils.month[d.getMonth()] + "  " + Utils.checkTimeStr(d.getHours()) + ":" + Utils.checkTimeStr(d.getMinutes());
                if (t && t.getDay) {
                    v += " - " + Utils.checkTimeStr(t.getHours()) + ":" + Utils.checkTimeStr(t.getMinutes())
                }
            }
            var j = "";
            var n = parseInt(h.season);
            if (!isNaN(n) && n > 0) {
                j = "T." + n + "&nbsp;";
                var A = parseInt(h.episodePartial);
                if (!isNaN(A) && A > 0) {
                    j += "E." + A + "&nbsp;"
                }
            }
            var s = h.title;
            var q = "" + h.episodeTitle;
            if (q.toLowerCase().indexOf(s.toLowerCase()) == 0) {
                s = q;
                q = ""
            }
            if (B.logoUrl) {
                k += "<span class='mytv-channel-logo' ><img src='" + API.image_base_url + B.logoUrl + "' ></span>"
            } else {
                k += "<span id='mytv-channel-name' class='channel green'>" + ((B && B.name) ? B.name : "") + "</span>"
            }
            k += "<h1 id='mytv-program-name' class='series'>" + s + "</h1>";
            if (j.length > 0 || q.length > 0) {
                k += "<h3 class='episode'><span class='episodeSeasonChapter' >" + j + "</span>" + q + "</h3>"
            }
            var x = h.type;
            if (h.genre) {
                x = x + " - " + h.genre
            }
            var z = "<h3 class='description'>" + (h.synopsis ? h.synopsis : (h.shortestSynopsis ? h.shortestSynopsis : "")) + "<br/>&nbsp;</h3>";
            var u = "";
            u += "<h3 class='description'>" + (h.productionYear ? h.productionYear + " - " : "") + x + "</h3>";
            var l = 0;
            if (h.usersReview) {
                l = Math.round(h.usersReview)
            }
            u += '<div class="user-votes">Votos Usuarios<span class="stars stars' + l + '"></span></div>';
            u += DataSheet.buildIconHTML(h, r, B);
            u += "<div class='limpiar' ></div>";
            if (y == true && !g) {
                k += u;
                k += z
            } else {
                k += "<div class='limpiar' ></div>";
                k += "<div class='description-frame1' >";
                k += z;
                k += "</div>";
                k += "<div class='description-frame2' >";
                k += u;
                if (h.cast) {
                    var b = DataSheet.getCastHTMLStrings(h.cast);
                    if (b.cast) {
                        k += "<div class='datalist-cast' ><span class='title'>Actores: </span>" + b.cast + "</div>"
                    }
                    if (b.producer) {
                        k += "<div class='datalist-cast' ><span class='title'>Productor: </span>" + b.producer + "</div>"
                    }
                    if (b.creator) {
                        k += "<div class='datalist-cast' ><span class='title'>Creador: </span>" + b.creator + "</div>"
                    }
                }
                if (h.language) {
                    var p = DataStore.get(Type.Language, h.language[0]);
                    k += "<div class='datalist-cast' ><span class='title'>Idioma original: </span>" + p.name + "</div>"
                }
                if (h.productionCountry) {
                    var o = DataStore.get(Type.Country, h.productionCountry[0]);
                    k += "<div class='datalist-cast' ><span class='title'>País: </span>" + o.name + "</div>"
                }
                k += "</div>";
                k += "<div class='limpiar' ></div>"
            }
        } catch (w) {
            console.log("DataSheet::getExtendedInfo:EX:" + w)
        }
        return {
            html: k,
            leaf: y,
            schedule: v
        }
    }
};
var DataList = {
    classname: "datalist",
    currentInfoLoaded: null,
    infoTimeout: null,
    recordings: [],
    info: null,
    initView: function() {
        TVA.putInnerHTML(document.getElementById("middle-preview-panel"), "");
        DataList.initFocus = DataList.focusInfo;
        DataList.focusInfo = null;
        DataList.buttonsPosition = 0;
        if (TVA.OTT.LIST_FOCUS_OVER_PLAY == false) {
            DataList.buttonsPosition = -1
        }
        DataList.playEnabled = false;
        DataList.recordingEnabled = false;
        API.getDataListContent(DataList.info, true);
        var a = $("#left-panel-title");
        var b = DataList.info && DataList.info.program && DataList.info.program.title && DataList.info.program.title != "" ? DataList.info.program.title : DataList.info && DataList.info.programNode ? DataList.info.programNode.title : "";
        a.html(b);
        var c = [];
        Footer.enableLeft();
        Footer.setLeft(c);
        LeftPanel.init({
            DataList: true,
            displayItems: 9,
            scrollLimit: 4,
            title: true,
            actualPos: true,
            classC: "side-panel-mytv",
            datalist: true
        });
        LeftPanel.hideMe(false);
        ThumbSlider.hideMe(true);
        $("#content-multi-panel").removeClass("hide-this");
        $("#multi-panel").removeClass("hide-this");
        MidPanel.hideMe(false);
        View.loaderHide();
        $("#prev-big-slider").addClass("hide-this");
        $("#next-big-slider").addClass("hide-this");
        $("#sliders").addClass("hide-this");
        $("#epg").addClass("hide-this")
    },
    setDetails: function(b, a) {
        DataList.info = b;
        if (DataList.info.programNode && DataList.info.program && isFinite(DataList.info.programNode["season"]) && DataList.info.programNode["season"] > 0 && DataList.info.program["title"] && DataList.info.program["title"].indexOf("T.") != 0) {
            DataList.info.program["title"] = "T." + DataList.info.programNode["season"] + " " + DataList.info.program["title"]
        }
        DataList.focusInfo = a
    },
    deInitView: function() {
        $("#multi-panel").addClass("hide-this");
        TVA.putInnerHTML(document.getElementById("middle-preview-panel"), "");
        TVA.putInnerHTML(document.getElementById("left-panel-list"), "");
        TVA.putInnerHTML(document.getElementById("current-item-left-panel"), "");
        LeftPanel.hideMe(true);
        LeftPanel.reset();
        MidPanel.hideMe(true);
        ThumbSlider.hideMe(true);
        ThumbSlider.reset(true);
        SidePanel.hideMe(true);
        SidePanel.reset();
        Commons.offFocus(View.actualFocus);
        Commons.offHover(View.actualHover)
    },
    setFocus: function() {
        LeftPanel.setFocus();
        var k = $("#left-panel-list");
        var b = k.find("li");
        if (DataList.initFocus) {
            var f = null;
            var u = null;
            var h = null;
            var q = DataList.initFocus.assetId;
            var m = DataList.initFocus.eventId;
            var a = DataList.initFocus.programId;
            var r = DataList.initFocus.programId;
            if (m) {
                a = null
            }
            var i = 0,
                e = -1,
                d = -1,
                n = -1;
            if (m || a) {
                b.each(function(v) {
                    if (n < 0 && $(this).data("assetId")) {
                        n = v
                    }
                    if (f !== null) {
                        return
                    }
                    if ((m && $(this).data("eventId") == m) || (!m && a && $(this).data("programId") == a)) {
                        f = $(this).attr("id")
                    }
                    if (q && h == null && $(this).data("assetId") == q) {
                        h = $(this).attr("id");
                        e = i
                    }
                    if (r && u == null && $(this).data("programId") == r) {
                        u = $(this).attr("id");
                        d = i
                    }
                    if (f === null && $(this).is(":visible")) {
                        i++
                    }
                })
            }
        }
        DataList.initFocus = null;
        if (h != null && e > 0 && e < LeftPanel.itemListLength) {
            i = e
        } else {
            if ((i <= 0 || i >= LeftPanel.itemListLength) && u != null && d >= 0 && d < LeftPanel.itemListLength) {
                i = d
            }
        }
        if (i >= LeftPanel.itemListLength) {
            i = 0
        }
        if (i <= 0 && n > 0 && n < LeftPanel.itemListLength) {
            i = n
        }
        if (i > 0) {
            LeftPanel.hideMe(false);
            var j = b.height();
            var o = j * i;
            var t = o;
            var s = k.parent().height();
            var p = k.height() - o;
            if (p < s) {
                o -= (s - p)
            }
            var c = (t - o) / j;
            if (c < LeftPanel.scrollLimit) {
                o -= ((LeftPanel.scrollLimit - c) * j)
            }
            if (o < 0) {
                o = 0
            }
            LeftPanel.actualItem = i;
            LeftPanel.visibleItem = (t - o) / j;
            if (LeftPanel.actualItem >= LeftPanel.itemListLength) {
                LeftPanel.actualItem = 0;
                o = 0
            }
            if (LeftPanel.actualItem > 0) {
                var g = document.getElementById("current-item-left-panel");
                var l = g.innerHTML;
                if (l != "") {
                    TVA.putInnerHTML(g, LeftPanel.actualItem + 1)
                }
            }
            k.css("top", -o)
        }
        LeftPanel.setFocus();
        Footer.enableLeft();
        DataList.checkButtons();
        TVA.invalidate()
    },
    buildLeftPanel: function(g, k) {
        var e = false;
        if (k && k.length) {
            e = true
        }
        var a = $("#left-panel-title");
        var f = a.html();
        a.html(f.replace(/^T\.([^ ])+/, ""));
        if (e) {
            if (DataList.info && DataList.info.parentId) {
                DataList.items = k;
                DataList.buildLeftPanelData(k, e);
                DataList.currentID = DataList.info.parentId;
                DataList.appendToLeftPanel(g)
            } else {
                if (g && g.length && g[0]) {
                    var j = g[0];
                    var d = DataStore.get(Type.Program, j.program);
                    for (var b = 0; b < k.length; b++) {
                        var h = k[b];
                        if (h && h.program != d.parent) {
                            g = g.concat(h);
                            e = true
                        }
                    }
                } else {
                    g = k
                }
                DataList.buildLeftPanelData(g, e);
                DataList.setFocus()
            }
        } else {
            DataList.buildLeftPanelData(g, e);
            DataList.setFocus()
        }
    },
    loadNode: function() {
        var b = $($("#left-panel-list").find("li.displayed")[LeftPanel.actualItem]);
        if (b.hasClass("master")) {
            return false
        }
        if (TVA.OTT.LIST_FOCUS_OVER_PLAY == false && DataList.buttonsPosition == -1) {
            var a = b.find(".folder-arrow");
            if (!a || !a.length || !a.is(":visible")) {
                DataList.moveFocus(1, 1, false);
                return true
            }
        }
        View.loaderShow();
        DataList.currentID = b.data("programId");
        API.getDataListContent({
            parentId: b.data("programId")
        }, false);
        return true
    },
    appendToLeftPanel: function(a) {
        View.loaderHide();
        if (a && a.length) {
            var b = -1;
            for (var c = 0; c < DataList.items.length; c++) {
                var d = DataList.items[c];
                if (d && d.program == DataList.currentID) {
                    b = c;
                    break
                }
            }
            if (b >= 0) {
                DataList.items.splice(b, 1)
            }
            if (a.length == 1) {
                a[0]["expanded"] = true
            }
            DataList.items = DataList.items.concat(a);
            DataList.buildLeftPanelData(DataList.items, DataList.joinByMaster);
            DataList.setFocus()
        }
    },
    buildLeftPanelData: function(m, r) {
        DataList.joinByMaster = (r === true);
        DataList.items = JSON.parse(JSON.stringify(m));
        View.loaderShow();
        try {
            var B = 1;
            var u = "";
            if (m) {
                var p = {};
                for (var J in m) {
                    if (m.hasOwnProperty(J)) {
                        var v = m[J];
                        var a = DataStore.get(Type.Program, v.program);
                        var d = DataStore.get(Type.Asset, v.asset);
                        var L = DataStore.get(Type.Event, v.event);
                        var z = DataStore.get(Type.Channel, L.channel ? L.channel : v.channel);
                        var q = null;
                        var D = "X" + a.id;
                        if (r == true) {
                            D = "X" + (a.master || a.id);
                            var x = parseInt(a.season);
                            if (!isNaN(x) && x > 0) {
                                D = ("0000" + a.season).slice(-4) + "_" + D
                            }
                        } else {
                            v.expanded = true;
                            D = "X"
                        }
                        if (!p[D]) {
                            p[D] = []
                        }
                        var n = a.id;
                        p[D].unshift({
                            id: n,
                            channel: z.id,
                            program: a.id,
                            asset: d.id,
                            event: L ? L.id : null,
                            type: v.iotype,
                            schedule: q,
                            fit: v.fit,
                            expired: v.expired,
                            expanded: (v.expanded === true)
                        })
                    }
                }

                function N(P) {
                    var j = [];
                    for (var e in P) {
                        if (P.hasOwnProperty(e)) {
                            j.push(e)
                        }
                    }
                    j.sort();
                    var Q = [];
                    for (var O = 0; O < j.length; O++) {
                        Q[j[O]] = P[j[O]]
                    }
                    return Q
                }
                try {
                    p = N(p)
                } catch (K) {}
                var l = Mytv.initFocus ? Mytv.initFocus.eventId : null;
                var f = Mytv.initFocus ? Mytv.initFocus.programId : null;
                if (l) {
                    f = null
                }
                var y = false;
                var o = 0;
                for (var I in p) {
                    if (p.hasOwnProperty(I)) {
                        var C = p[I];
                        var E = "";
                        var w = false;
                        for (var H in C) {
                            if (C.hasOwnProperty(H)) {
                                v = C[H];
                                z = DataStore.get(Type.Channel, v.channel);
                                a = DataStore.get(Type.Program, v.program);
                                d = DataStore.get(Type.Asset, v.asset);
                                L = DataStore.get(Type.Event, v.event);
                                if (L.id == "null" || L.id == null) {
                                    L.id = ""
                                }
                                if (d.id == "null" || d.id == null) {
                                    d.id = ""
                                }
                                var g = parseInt(a.season);
                                var s = "";
                                if ((C.length > 1 || v.expanded === true || r == false) && H == 0) {
                                    s = a.title;
                                    if (!isNaN(g) && g > 0) {
                                        s = '<div class="folder-arrow expanded"></div><div class="mytv-season-title" >' + s + '</div><div class="mytv-season-div" >T.' + a.season + "</div>"
                                    } else {
                                        if (r == false) {
                                            s = '<div class="folder-arrow expanded"></div><div class="mytv-season-title" >' + s + "</div>"
                                        }
                                    }
                                    var A = a.id;
                                    if (a.parent) {
                                        A = a.parent
                                    }
                                    w = true;
                                    E += '<li id="left-panel-option' + o + '" class="itemTV master displayed" data-programId="' + A + '" data-channelId="' + z.id + '" data-masterId="' + a.master + '" onmouseover="LeftPanel.hoverTo(' + o + ', -1);" onclick="LeftPanel.click();">' + s + "</li>"
                                }
                                y = true;
                                if (r == true) {
                                    if (C.length == 1 && v.expanded !== true) {
                                        s = a.title;
                                        if (a.episodeTitle) {
                                            var t = "" + a.episodeTitle;
                                            if (t.toLowerCase().indexOf(s.toLowerCase()) == 0) {
                                                s = t
                                            } else {
                                                if (t.length > 0) {
                                                    s += ": " + t
                                                }
                                            }
                                        }
                                        if (!isNaN(g) && g > 0) {
                                            s = '<div class="folder-arrow folder-arrow-visible"></div><div class="mytv-season-title" >' + s + '</div><div class="mytv-season-div" >T.' + a.season + "</div>"
                                        }
                                        E += '<li id="left-panel-option' + o + '" class="itemTV displayed" data-itemId="' + v.id + '" data-eventId="' + L.id + '" data-programId="' + a.id + '" data-assetId="' + d.id + '" data-channelId="' + z.id + '" data-masterId="' + a.master + '" onmouseover="LeftPanel.hoverTo(' + o + ', -1);" onclick="LeftPanel.click();">' + s + "</li>"
                                    } else {
                                        s = a.episodeTitle;
                                        E += '<li id="child-panel-option' + o + "-" + H + '" class="itemTV child-item hide-this left-panel-option' + o + '" data-itemId="' + v.id + '" data-eventId="' + L.id + '" data-programId="' + a.id + '" data-assetId="' + d.id + '" data-channelId="' + z.id + '" data-masterId="' + a.master + '" onmouseover="LeftPanel.hoverTo(' + o + ", " + H + ');" onclick="LeftPanel.click();">' + s + "</li>"
                                    }
                                } else {
                                    s = a.title;
                                    if (a.episodeTitle) {
                                        s = a.episodeTitle
                                    } else {
                                        var G = parseInt(a.episodePartial);
                                        if (!isNaN(G) && G > 0) {
                                            s = "E." + G
                                        }
                                    }
                                    var c = "left";
                                    var M = o;
                                    var b = "LeftPanel.hoverTo(" + o + ", -1);";
                                    var h = "";
                                    if (w == true) {
                                        M += "-" + H;
                                        b = "LeftPanel.hoverTo(" + o + ", " + H + ");";
                                        c = "child";
                                        h = "child-item left-panel-option" + o
                                    }
                                    E += '<li id="' + c + "-panel-option" + M + '" class="itemTV ' + h + ' displayed" data-itemId="' + v.id + '" data-eventId="' + L.id + '" data-programId="' + a.id + '" data-assetId="' + d.id + '" data-channelId="' + z.id + '" data-masterId="' + a.master + '" onmouseover="' + b + '" onclick="LeftPanel.click();">' + s + "</li>"
                                }
                            }
                        }
                        if (y == true) {
                            E = E.replace(/hide\-this/g, "displayed")
                        }
                        u += E;
                        E = "";
                        y = false;
                        o++
                    }
                }
            } else {
                B = "";
                PopMsg.show("info", 44)
            }
            TVA.putInnerHTML(document.getElementById("left-panel-list"), u);
            $("#left-panel-actual-pos").show();
            TVA.putInnerHTML(document.getElementById("current-item-left-panel"), B)
        } catch (F) {}
        View.loaderHide()
    },
    recAsset: function(d) {
        if (DataList.buttonsPosition != 0 && d !== true) {
            return false
        }
        var e = $("#left-panel-list").find("li.displayed").eq(LeftPanel.actualItem);
        var g = e.data("programId");
        var a = DataStore.get(Type.Program, g);
        var f = DataStore.get(Type.Event, e.data("eventId"));
        var h = f.endTime;
        var c = Utils.now();
        var b = e.data("assetId");
        b = !(b == "null" || b == "" || b == null);
        DataSheet.setDetails(DataList.info.programId, DataList.info.eventId, DataList.info.channelId, e.data("assetId"), false);
        if (!b && e.data("eventId") && (a.parent || a.master)) {
            PopUp.showMe("recording-chapter", false, "");
            PopUp.setCallback((h.getTime() > c) ? DataList.recordingChapter : DataList.recordingChapterFinished)
        } else {
            if (!b && h && h.getTime && h.getTime() > c) {
                DataList.recordingChapter(false)
            } else {
                DataList.recordingChapter(true)
            }
        }
        return true
    },
    recordingChapterFinished: function(a) {
        if (a == false) {
            PopMsg.showMessage("error", PopMsg.getText(10))
        } else {
            DataList.recordingChapter(a)
        }
    },
    recordingChapter: function(a) {
        var c = $("#left-panel-list").find("li.displayed").eq(LeftPanel.actualItem);
        var b = {
            programId: c.data("programId"),
            eventId: c.data("eventId"),
            assetId: c.data("assetId"),
            channelId: c.data("channelId")
        };
        if (b.eventId) {
            API.addMyTVItem("recording", b.eventId, "", a)
        } else {
            API.addMyTVItem("program-recording", b.programId, b.channelId)
        }
    },
    playAsset: function() {
        if (DataList.buttonsPosition != 0) {
            return false
        }
        try {
            var b = $("#left-panel-list").find("li.displayed").eq(LeftPanel.actualItem);
            var d = b.data("assetId");
            if (!d || d == "undefined") {
                d = Utils.findAsset(b.data("programId"), b.data("eventId"))
            }
            var a = {
                programId: b.data("programId"),
                eventId: b.data("eventId"),
                assetId: d
            };
            if (a.assetId) {
                DataList.focusInfo = {
                    eventId: b.data("eventId"),
                    programId: b.data("programId"),
                    channelId: b.data("channelId")
                };
                a.isLive = false;
                VideoPlayer.setDetails("datasheet", a);
                View.changeView(VideoPlayer);
                return true
            }
        } catch (c) {}
        return false
    },
    checkRecordingEnabled: function(c) {
        var f = false;
        try {
            var a = DataStore.get(Type.Event, c.data("eventId"));
            var d = a.startTime;
            var g = a.endTime;
            var b = Utils.now();
            var j = (d && d.getTime && d.getTime() > b);
            var h = (!j && g && g.getTime() >= b);
            if (Main.username !== "") {
                if (j || h) {
                    f = true
                } else {
                    if (DataSheet.info.programId && DataList.info.channelId) {
                        f = true
                    }
                }
            }
        } catch (i) {}
        DataList.recordingEnabled = f
    },
    buttonsPosition: 0,
    getButtons: function(c, h) {
        DataList.buttonsPosition = 0;
        if (TVA.OTT.LIST_FOCUS_OVER_PLAY == false) {
            DataList.buttonsPosition = -1
        }
        DataList.playEnabled = false;
        DataList.recordingEnabled = false;
        var g = false;
        if (c.hasClass("master")) {
            g = true
        } else {
            var b = c.find(".folder-arrow");
            if (b && b.length && b.is(":visible")) {
                g = true
            }
        }
        var f = "";
        var d = "";
        if (h.schedule && h.schedule != "") {
            d += "<div class='datalist-rec-date datalist-rec-date-on' >" + h.schedule + "</div>"
        }
        var i = c.data("assetId");
        var a = c.data("eventId");
        if (i) {
            var e = DataStore.get(Type.Asset, i);
            if (e) {
                f += "<span class='mytv-button mytv-button-1 mytv-button-play' onmouseover='DataList.moveFocus(0,1,true);' onclick='DataList.clickButton(1);' ><img src='./resource/ficha/ver-ahora-on.png' /></span>";
                DataList.playEnabled = true
            } else {
                DataList.checkRecordingEnabled(c);
                f += d + "<span class='mytv-button mytv-button-1 mytv-button-rec' onmouseover='DataList.moveFocus(0,1,true);' onclick='DataList.clickButton(1);' ><img src='./resource/ficha/grabar-on.png' /></span>"
            }
        } else {
            DataList.checkRecordingEnabled(c);
            f += d + "<span class='mytv-button mytv-button-1 mytv-button-rec' onmouseover='DataList.moveFocus(0,1,true);' onclick='DataList.clickButton(1);' ><img src='./resource/ficha/grabar-on.png' /></span>"
        }
        if (g || TVA.OTT.LIST_FOCUS_OVER_PLAY == false) {
            DataList.buttonsPosition = -1;
            f = f.replace("-on.png", "-off.png");
            if (g) {
                f = f.replace("class='", "class='mytv-button-master ");
                f = f.replace("grabar-", "grabar-serie-")
            }
            f = f.replace("datalist-rec-date-on", "")
        }
        DataList.checkButtons();
        return '<span class="mytv-buttons">' + f + "</span>"
    },
    buildMiddlePanel: function(o) {
        var d = $("#left-panel-list").find("li.displayed").eq(LeftPanel.actualItem);
        var b = d.data("programId");
        var h = DataStore.get(Type.Program, b);
        var s = DataStore.get(Type.Channel, d.data("channelId"));
        var k = d.data("eventId");
        var m = DataStore.get(Type.Event, ((k == "" || k == null || k == "null" || !k) ? o.event : d.data("eventId")));
        var i = DataSheet.getExtendedInfo(h, s, m, d);
        var j = i.html;
        j += DataList.getButtons(d, i, h, s);
        var a = $("#middle-preview-panel");
        a.addClass("datalist").removeClass("mytvdata");
        var q = a.find(".info");
        if (q && q.length) {
            q.html(j);
            var c = a.find(".bg-image");
            var r = c.attr("src");
            var e = h.listBgUrl ? API.image_base_url + h.listBgUrl : "./resource/general/generic-container.jpg";
            if (e != r) {
                c.attr("src", e)
            }
        } else {
            j = "<div class='info'>" + j + "</div>";
            if (h.listBgUrl) {
                j += "<img class='bg-image' src='" + API.image_base_url + h.listBgUrl + "' onerror=\"this.onerror=null;this.src='./resource/general/generic-container.jpg'\"  alt=''>"
            } else {
                j += "<img class='bg-image' src='./resource/general/generic-container.jpg'  alt=''>"
            }
            j += "<div class='bg-mask'></div>";
            TVA.putInnerHTML(document.getElementById("middle-preview-panel"), j)
        }
        TVA.invalidate();
        if (i.leaf == false) {
            var g = $(".description-frame1").height();
            var f = $(".description-frame2").height();
            var n = $(".mytv-buttons");
            var p = n.height();
            if (n.length == 1) {
                p = 75
            }
            if (p > 0) {
                var l = f - g;
                if (l > p) {
                    l = p
                } else {
                    if (l < 0) {
                        l = 0
                    }
                }
                if (p > 0) {
                    n.css("marginTop", "-" + l + "px")
                }
            }
        }
    },
    loadInfo: function(a) {
        if (a) {
            DataList.currentInfoLoaded = a;
            API.getMyTVProgramDetails(a, true)
        }
    },
    keyHandler: function(a) {
        if (View.actualFocus == "left-panel") {
            LeftPanel.keyHandler(a)
        }
    },
    setStatus: function(a, e) {
        if (a) {
            var d = a.find("img");
            if (d && d.length) {
                var g = d.attr("src");
                var c = g;
                if (e == true) {
                    g = g.replace("-off", "-on")
                } else {
                    g = g.replace("-on", "-off")
                }
                if (g != c) {
                    d.attr("src", g)
                }
                if (g.indexOf("grabar") > 0) {
                    var f = $(".datalist-rec-date");
                    if (e) {
                        f.addClass("datalist-rec-date-on")
                    } else {
                        f.removeClass("datalist-rec-date-on")
                    }
                }
            }
        }
    },
    moveFocus: function(c, g, b) {
        try {
            if (c == 0 && DataList.buttonsPosition == -1 && b !== true) {
                return
            }
            var j = $(".mytv-button-1");
            var i = $(".mytv-button-2");
            if (!j.length) {
                return
            }
            var d = j.html();
            var a = i && i.length ? i.html() : "";
            var h = j.hasClass("mytv-button-master");
            if (c < 0 || c > 0) {
                if (h || TVA.OTT.LIST_FOCUS_OVER_PLAY == false) {
                    DataList.buttonsPosition += c;
                    if (DataList.buttonsPosition <= -2) {
                        DataList.buttonsPosition = (a == "") ? 0 : 1
                    } else {
                        if (DataList.buttonsPosition >= 2) {
                            DataList.buttonsPosition = -1
                        }
                    }
                    if (a == "" && DataList.buttonsPosition >= 1) {
                        DataList.buttonsPosition = -1
                    }
                    switch (DataList.buttonsPosition) {
                        case -1:
                            DataList.setStatus(j, false);
                            DataList.setStatus(i, false);
                            break;
                        case 0:
                            DataList.setStatus(j, true);
                            DataList.setStatus(i, false);
                            break;
                        case 1:
                            DataList.setStatus(j, false);
                            DataList.setStatus(i, true);
                            break
                    }
                } else {
                    if (d.indexOf("-on") > 0 && a != "") {
                        DataList.setStatus(j, false);
                        DataList.setStatus(i, true);
                        DataList.buttonsPosition = 1
                    } else {
                        DataList.setStatus(j, true);
                        DataList.setStatus(i, false);
                        DataList.buttonsPosition = 0
                    }
                }
            } else {
                if (g > 0 && g < 3) {
                    if (g == 2 && a != "") {
                        DataList.setStatus(j, false);
                        DataList.setStatus(i, true);
                        DataList.buttonsPosition = 1
                    } else {
                        DataList.setStatus(j, true);
                        DataList.setStatus(i, false);
                        DataList.buttonsPosition = 0
                    }
                } else {
                    if (g == -1 && (h || TVA.OTT.LIST_FOCUS_OVER_PLAY == false)) {
                        DataList.setStatus(j, false);
                        DataList.setStatus(i, false);
                        Mytv.buttonsPosition = -1
                    }
                }
            }
            DataList.checkButtons()
        } catch (f) {}
    },
    checkButtons: function() {
        var d = [];
        var b = (DataList.playEnabled == true && DataList.buttonsPosition == 0);
        if (b == true) {
            d.push({
                text: "Ver",
                className: "enter-button-footer",
                keycode: TVA.tvKey.KEY_ENTER,
                method: function() {
                    if (View.actualFocus === "header") {
                        return true
                    }
                    DataList.clickButton((DataList.playEnabled == true && DataList.buttonsPosition <= 0) ? 1 : 3);
                    return false
                }
            })
        }
        d.push({
            text: "Votar",
            className: "one-button-footer",
            keycode: TVA.tvKey.KEY_1,
            method: function() {
                DataList.clickButton(3);
                return false
            }
        });
        var j = b;
        var l = false;
        var f = $("#left-panel-list").find("li.displayed");
        var a = f.eq(LeftPanel.actualItem);
        DataList.assetId = "";
        if (a) {
            var g = a.data("programId");
            var e = DataStore.get(Type.Program, g);
            if (e && (e.parent || e.master)) {
                j = true
            } else {
                if (e) {
                    var k = $(f[LeftPanel.actualItem]);
                    if (k.hasClass("master")) {
                        j = true
                    }
                }
            }
            if (Main.username !== "" && b) {
                l = true;
                var c = DataStore.get(Type.Asset, a.data("assetId"));
                if (c && c.type !== "Catchup") {
                    l = false
                } else {
                    DataList.assetId = c.id
                }
            }
        }
        if (j) {
            d.push({
                text: "Grabar",
                className: "red-button-footer",
                keycode: TVA.tvKey.KEY_RED,
                disabled: l,
                method: function() {
                    DataList.recAsset(true);
                    return false
                }
            })
        }
        var i = "green-button-footer";
        var h = TVA.tvKey.KEY_GREEN;
        if (TVA.device == "ps3") {
            i = "yellow-button-footer";
            h = TVA.tvKey.KEY_YELLOW
        }
        d.push({
            text: "Ver + tarde",
            className: i,
            keycode: h,
            disabled: !l,
            method: function() {
                if (DataList.assetId && DataList.assetId != "") {
                    API.addMyTVItem("watch-later", DataList.assetId)
                }
                return false
            }
        });
        Footer.setLeft(d)
    },
    clickButton: function(d) {
        DataList.moveFocus(0, d, true);
        if (d == 3) {
            var c = $($("#left-panel-list").find("li.displayed")[LeftPanel.actualItem]);
            var b = c.data("programId");
            if (b) {
                var a = DataStore.get(Type.Program, b);
                PopUp.setVotingDetails(b, a.userVote);
                PopUp.showMe("voting", false, "");
                View.changeView(PopUp)
            }
            return
        }
        LeftPanel.keyHandler(TVA.tvKey.KEY_ENTER)
    }
};
var Mytv = {
    classname: "mytv",
    type: "recordings",
    currentInfoLoaded: null,
    infoTimeout: null,
    recordings: [],
    initView: function() {
        TVA.putInnerHTML(document.getElementById("middle-preview-panel"), "");
        Mytv.initFocus = Mytv.focusInfo;
        Mytv.focusInfo = null;
        Mytv.buttonsPosition = 0;
        if (TVA.OTT.LIST_FOCUS_OVER_PLAY == false) {
            Mytv.buttonsPosition = -1
        }
        Mytv.playEnabled = false;
        Header.actualPage = 3;
        API.getMyTVContent(Mytv.type);
        var a = $("#left-panel-title");
        if (Mytv.type == "watch-later") {
            a.html("Ver más tarde")
        } else {
            if (Mytv.type == "recordings") {
                a.html("Mis Grabaciones")
            } else {
                if (Mytv.type == "pending-recordings") {
                    a.html("Pendientes")
                }
            }
        }
        var b = [];
        b.push({
            text: "Grabaciones",
            className: "red-button-footer",
            keycode: TVA.tvKey.KEY_RED,
            method: function() {
                var c = "recordings";
                if (Mytv.type != c) {
                    Mytv.type = c;
                    View.loaderShow();
                    Mytv.initView()
                }
                return false
            }
        });
        b.push({
            text: "Pendientes",
            className: "green-button-footer",
            keycode: TVA.tvKey.KEY_GREEN,
            method: function() {
                var c = "pending-recordings";
                if (Mytv.type != c) {
                    Mytv.type = c;
                    View.loaderShow();
                    Mytv.initView()
                }
                return false
            }
        });
        b.push({
            text: "Más tarde",
            className: "yellow-button-footer",
            keycode: TVA.tvKey.KEY_YELLOW,
            method: function() {
                var c = "watch-later";
                if (Mytv.type != c) {
                    Mytv.type = c;
                    View.loaderShow();
                    Mytv.initView()
                }
                return false
            }
        });
        b.push({
            text: "Ver",
            className: "enter-button-footer",
            disabled: true,
            keycode: TVA.tvKey.KEY_ENTER,
            method: function() {
                if (View.actualFocus === "header") {
                    return true
                }
                Mytv.clickButton((Mytv.playEnabled == true && Mytv.buttonsPosition == 0) ? 1 : 2);
                return false
            }
        });
        b.push({
            text: "Ficha",
            className: "one-button-footer",
            keycode: TVA.tvKey.KEY_1,
            method: function() {
                LeftPanel.click(TVA.tvKey.KEY_1);
                return false
            }
        });
        b.push({
            text: "Borrar",
            className: "two-button-footer",
            keycode: TVA.tvKey.KEY_2,
            method: function() {
                var e = $("#left-panel-list").find("li.displayed");
                var g = e.eq(LeftPanel.actualItem);
                var c = null;
                var f = null;
                if (LeftPanel.actualItem > 0) {
                    c = e.eq(LeftPanel.actualItem - 1);
                    if (c && c.attr("class").indexOf("master") >= 0 && LeftPanel.actualItem < LeftPanel.itemListLength - 1) {
                        f = e.eq(LeftPanel.actualItem + 1);
                        if (f.attr("class").indexOf("master") < 0) {
                            c = f
                        }
                    }
                } else {
                    if (LeftPanel.actualItem < LeftPanel.itemListLength - 1) {
                        c = e.eq(LeftPanel.actualItem + 1);
                        if (c && c.attr("class").indexOf("master") >= 0 && LeftPanel.actualItem > 0) {
                            f = e.eq(LeftPanel.actualItem - 1);
                            if (f.attr("class").indexOf("master") < 0) {
                                c = f
                            }
                        }
                    }
                }
                if (!LeftPanel.checkMaster(g)) {
                    var i = "";
                    switch (Mytv.type) {
                        case "recordings":
                            i = "¿Seguro que quieres eliminar la grabación?";
                            break;
                        case "pending-recordings":
                            i = "¿Seguro que quieres cancelar la grabación?";
                            var h = DataStore.get(Type.Schedule, g.data("itemId"));
                            if (h && h.iotype == "ScheduleProgram") {
                                var d = DataStore.get(Type.Program, g.data("programId"));
                                if (d && d.type == "Serie") {
                                    i = "¿Seguro que quieres cancelar";
                                    if (d.season > 0 && d.episode <= 0) {
                                        i += " la Temporada " + d.season + " de"
                                    }
                                    i += ' "' + d.title + '" ?'
                                }
                            }
                            break;
                        case "watch-later":
                            i = "¿Seguro que quieres eliminar el item?";
                            break;
                        default:
                            return true
                    }
                    PopUp.showMe("delete", false, i);
                    PopUp.setCallback(function(j) {
                        if (j) {
                            var k = g.data("itemId");
                            if (c) {
                                Mytv.focusInfo = {
                                    eventId: c.data("eventId"),
                                    programId: c.data("programId")
                                }
                            }
                            API.deleteMyTVItem(Mytv.type, k)
                        } else {
                            Mytv.focusInfo = null
                        }
                    });
                    View.changeView(PopUp)
                }
                return false
            }
        });
        Footer.enableLeft();
        Footer.setLeft(b);
        LeftPanel.init({
            mytv: true,
            displayItems: 9,
            scrollLimit: 4,
            title: true,
            actualPos: true,
            classC: "side-panel-mytv"
        });
        LeftPanel.hideMe(false);
        ThumbSlider.init({
            thumbListContainer: "small-slider-vertical",
            thumbContainer: "preview-list-thumbnail-right-panel",
            thumbName: "thumb-vertical",
            vertical: true
        });
        ThumbSlider.hideMe(true);
        $("#content-multi-panel").removeClass("hide-this");
        $("#multi-panel").removeClass("hide-this");
        MidPanel.hideMe(false);
        View.loaderHide();
        $("#prev-big-slider").addClass("hide-this");
        $("#next-big-slider").addClass("hide-this");
        $("#sliders").addClass("hide-this");
        $("#epg").addClass("hide-this")
    },
    deInitView: function() {
        $("#multi-panel").addClass("hide-this");
        TVA.putInnerHTML(document.getElementById("middle-preview-panel"), "");
        TVA.putInnerHTML(document.getElementById("left-panel-list"), "");
        TVA.putInnerHTML(document.getElementById("current-item-left-panel"), "");
        LeftPanel.hideMe(true);
        LeftPanel.reset();
        MidPanel.hideMe(true);
        ThumbSlider.hideMe(true);
        ThumbSlider.reset(true);
        SidePanel.hideMe(true);
        SidePanel.reset();
        Commons.offFocus(View.actualFocus);
        Commons.offHover(View.actualHover)
    },
    setFocus: function() {
        LeftPanel.setFocus();
        var f = $("#left-panel-list");
        var l = f.find("li");
        if (Mytv.initFocus) {
            var c = null;
            var a = Mytv.initFocus.eventId;
            var h = Mytv.initFocus.programId;
            if (a) {
                h = null
            }
            var m = 0;
            if (a || h) {
                l.each(function() {
                    if (c !== null) {
                        return
                    }
                    if ((a && $(this).data("eventId") == a) || (!a && h && $(this).data("programId") == h)) {
                        c = $(this).attr("id")
                    }
                    if (c === null && $(this).is(":visible")) {
                        m++
                    }
                })
            }
        }
        Mytv.initFocus = null;
        if (m > 0) {
            LeftPanel.hideMe(false);
            var e = l.height();
            var j = e * m;
            var d = j;
            var k = f.parent().height();
            var g = f.height() - j;
            if (g < k) {
                j -= (k - g)
            }
            var b = (d - j) / e;
            if (b < LeftPanel.scrollLimit) {
                j -= ((LeftPanel.scrollLimit - b) * e)
            }
            if (j < 0) {
                j = 0
            }
            LeftPanel.actualItem = m;
            LeftPanel.visibleItem = (d - j) / e;
            if (LeftPanel.actualItem > 0) {
                var i = document.getElementById("current-item-left-panel");
                var n = i.innerHTML;
                if (n != "") {
                    TVA.putInnerHTML(i, LeftPanel.actualItem + 1)
                }
            }
            f.css("top", -j)
        }
        LeftPanel.setFocus();
        TVA.invalidate()
    },
    buildLeftPanel: function(q) {
        View.loaderShow();
        try {
            var d = 1;
            var l = "";
            if (q) {
                var D = {};
                for (var B in q) {
                    if (q.hasOwnProperty(B)) {
                        var E = q[B];
                        var e, n, H, z;
                        if ((E.iotype === "Recording") || (E.iotype === "RecordingProgram") || (E.iotype === "PendingRecording") || (E.iotype === "YouMissedIt")) {
                            e = DataStore.get(Type.Program, E.program);
                            n = DataStore.get(Type.Asset, E.asset);
                            z = DataStore.get(Type.Event, E.event);
                            H = DataStore.get(Type.Channel, z.channel ? z.channel : E.channel)
                        } else {
                            n = DataStore.get(Type.Asset, E.asset);
                            e = DataStore.get(Type.Program, n.program);
                            H = DataStore.get(Type.Channel, n.channel ? n.channel : E.channel)
                        }
                        var C = null;
                        if (Mytv.type == "pending-recordings" && E.schedule) {
                            C = DataStore.get(Type.Schedule, E.schedule)
                        }
                        var u = "X" + (e.master || e.id);
                        if (E.iotype === "PendingRecording") {
                            u = "X" + e.id
                        }
                        var s = parseInt(e.season);
                        if (!isNaN(s) && s > 0) {
                            u += "_" + e.season
                        }
                        if (!D[u]) {
                            D[u] = []
                        }
                        var m = E.id;
                        if (E.iotype === "PendingRecording") {
                            m = E.schedule
                        }
                        if ((Mytv.type == "watch-later") || (Mytv.type == "recordings")) {
                            if ((n.id === null) && (Mytv.type == "watch-later")) {
                                continue
                            }
                            if ((n.id === null) && ((Mytv.type == "recordings") && (E.fit === true) && (E.expired === false))) {
                                continue
                            }
                        }
                        D[u].unshift({
                            id: m,
                            channel: H.id,
                            program: e.id,
                            asset: n.id,
                            event: z ? z.id : null,
                            type: E.iotype,
                            schedule: C,
                            fit: E.fit,
                            expired: E.expired
                        });
                        var c = e.id;
                        var g = 0;
                        if (C) {
                            g = C.usagePercent
                        }
                        Mytv.recordings[c] = {
                            fit: E.fit,
                            expired: E.expired,
                            usagePercent: g
                        }
                    }
                }
                var p = Mytv.initFocus ? Mytv.initFocus.eventId : null;
                var b = Mytv.initFocus ? Mytv.initFocus.programId : null;
                if (p) {
                    b = null
                }
                var F = false;
                var y = 0;
                var o = "",
                    f = "";
                for (var x in D) {
                    if (D.hasOwnProperty(x)) {
                        var h = D[x];
                        var a = "";
                        for (var w in h) {
                            if (h.hasOwnProperty(w)) {
                                E = h[w];
                                H = DataStore.get(Type.Channel, E.channel);
                                e = DataStore.get(Type.Program, E.program);
                                n = DataStore.get(Type.Asset, E.asset);
                                z = DataStore.get(Type.Event, E.event);
                                if (E.schedule && E.schedule.usagePercent) {
                                    if (E.schedule.usagePercent > 100) {
                                        o = " usage-gt-100"
                                    } else {
                                        o = ""
                                    }
                                } else {
                                    o = ""
                                }
                                if (Mytv.type == "pending-recordings") {
                                    f = " "
                                } else {
                                    if ((E.type == "Recording" || E.type == "WatchLater" || E.type == "RecordingProgram") && ((E.fit == false) || (E.expired == true))) {
                                        f = " unfitorexpired"
                                    } else {
                                        f = " "
                                    }
                                }
                                var t = parseInt(e.season);
                                var A = "";
                                if (h.length > 1 && w == 0) {
                                    A = e.title;
                                    if (!isNaN(t) && t > 0) {
                                        A = '<div class="folder-arrow"></div><div class="mytv-season-title" >' + A + '</div><div class="mytv-season-div" >T.' + e.season + "</div>"
                                    }
                                    a += '<li id="left-panel-option' + y + '" class="itemTV master displayed' + o + f + '" data-programId="' + (e.master ? e.master : e.id) + '" data-channelId="' + H.id + '" data-masterId="' + e.master + '" onmouseover="LeftPanel.hoverTo(' + y + ', -1);" onclick="LeftPanel.click();"><div class="folder-arrow"></div>' + A + "</li>"
                                }
                                if ((p && z.id == p) || (!p && b && e.id == b)) {
                                    F = true
                                }
                                if (h.length == 1) {
                                    A = e.title;
                                    if (e.episodeTitle) {
                                        var v = "" + e.episodeTitle;
                                        if (v.toLowerCase().indexOf(A.toLowerCase()) == 0) {
                                            A = v
                                        } else {
                                            if (v.length > 0) {
                                                A += ": " + v
                                            }
                                        }
                                    }
                                    if (!isNaN(t) && t > 0) {
                                        A = '<div class="folder-arrow"></div><div class="mytv-season-title" >' + A + '</div><div class="mytv-season-div" >T.' + e.season + "</div>"
                                    }
                                    a += '<li id="left-panel-option' + y + '" class="itemTV displayed' + o + f + '" data-itemId="' + E.id + '" data-eventId="' + z.id + '" data-programId="' + e.id + '" data-assetId="' + n.id + '" data-channelId="' + H.id + '" data-masterId="' + e.master + '" onmouseover="LeftPanel.hoverTo(' + y + ', -1);" onclick="LeftPanel.click();">' + A + "</li>"
                                } else {
                                    A = e.episodeTitle;
                                    if (E.type == "PendingRecording") {
                                        A = e.title + " T." + e.season
                                    } else {
                                        if (E.type == "Recording" && e.season) {
                                            var G = parseInt(e.episodePartial);
                                            if (!isNaN(G) && G > 0) {
                                                A = "E." + G + "&nbsp;" + A
                                            }
                                        }
                                    }
                                    a += '<li id="child-panel-option' + y + "-" + w + '" class="itemTV child-item hide-this left-panel-option' + y + "" + o + f + '" data-itemId="' + E.id + '" data-eventId="' + z.id + '" data-programId="' + e.id + '" data-assetId="' + n.id + '" data-channelId="' + H.id + '" data-masterId="' + e.master + '" onmouseover="LeftPanel.hoverTo(' + y + ", " + w + ');" onclick="LeftPanel.click();">' + A + "</li>"
                                }
                            }
                        }
                        if (F == true) {
                            a = a.replace(/hide\-this/g, "displayed")
                        }
                        l += a;
                        a = "";
                        F = false;
                        y++
                    }
                }
            } else {
                d = "";
                if (Mytv.type === "recordings") {
                    PopMsg.show("info", 43)
                } else {
                    PopMsg.show("info", 44)
                }
            }
            TVA.putInnerHTML(document.getElementById("left-panel-list"), l);
            $("#left-panel-actual-pos").show();
            TVA.putInnerHTML(document.getElementById("current-item-left-panel"), d);
            Mytv.setFocus()
        } catch (r) {}
        View.loaderHide()
    },
    loadNode: function() {
        var b = $($("#left-panel-list").find("li.displayed")[LeftPanel.actualItem]);
        if (TVA.OTT.LIST_FOCUS_OVER_PLAY == false && Mytv.buttonsPosition == -1) {
            var a = b.find(".folder-arrow");
            if (!a || !a.length || !a.is(":visible")) {
                Mytv.moveFocus(1, 1, false);
                return true
            }
        }
        return false
    },
    playAsset: function() {
        try {
            if (Mytv.playEnabled == false) {
                return false
            }
            var b = $("#left-panel-list").find("li.displayed").eq(LeftPanel.actualItem);
            var d = b.data("assetId");
            if (!d || d == "undefined") {
                d = Utils.findAsset(b.data("programId"), b.data("eventId"))
            }
            var a = {
                programId: b.data("programId"),
                eventId: b.data("eventId"),
                assetId: d
            };
            if (a.assetId) {
                Mytv.focusInfo = {
                    eventId: b.data("eventId"),
                    programId: b.data("programId"),
                    channelId: b.data("channelId")
                };
                a.isLive = false;
                VideoPlayer.setDetails("datasheet", a);
                View.changeView(VideoPlayer);
                return true
            }
        } catch (c) {}
        return false
    },
    buttonsPosition: 0,
    getButtons: function(e) {
        Mytv.buttonsPosition = 0;
        if (TVA.OTT.LIST_FOCUS_OVER_PLAY == false) {
            Mytv.buttonsPosition = -1
        }
        Mytv.playEnabled = false;
        var a = "";
        var f = e.data("assetId");
        var d = e.data("eventId");
        if (f) {
            var c = DataStore.get(Type.Asset, f);
            if (c) {
                a += "<span class='mytv-button mytv-button-1' onmouseover='Mytv.moveFocus(0,1,true);' onclick='Mytv.clickButton(1);' ><img src='./resource/ficha/ver-ahora-on.png' /></span>";
                Mytv.playEnabled = true
            }
        }
        if (TVA.OTT.LIST_FOCUS_OVER_PLAY == false) {
            Mytv.buttonsPosition = -1;
            a = a.replace("-on.png", "-off.png");
            a = a.replace("datalist-rec-date-on", "")
        }
        Mytv.checkButtons();
        var b = "mytv-buttons";
        if (a == "") {
            b += " mytv-buttons-hidden"
        }
        return '<span class="' + b + '">' + a + "</span>"
    },
    buildMiddlePanel: function(a) {
        var e = $("#left-panel-list").find("li.displayed").eq(LeftPanel.actualItem);
        var i = e.data("programId");
        var g = DataStore.get(Type.Program, i);
        var k = DataStore.get(Type.Channel, e.data("channelId"));
        var d = e.data("channelId");
        var c = DataStore.get(Type.Event, ((d == "" || d == null || d == "null" || !d) ? a.event : e.data("eventId")));
        var l = DataSheet.getExtendedInfo(g, k, c, e);
        var h = l.html;
        var j = "";
        var n = false;
        if (Mytv.type == "pending-recordings") {
            j += "<div class='bg-mask'></div>"
        } else {
            if (Mytv.recordings[i] && (Mytv.recordings[i].expired === true || Mytv.recordings[i].fit === false)) {
                n = true;
                j += "<div class='bg-mask-disabled' style='color:white'><div class='disabled-content'><p>El periodo de disponibilidad de esta grabación ha finalizado.<br /><br />Si lo deseas, puedes ampliar el periodo de disponibilidad de las grabaciones ampliando tu suscripción.</p></div></div>"
            } else {
                j += "<div class='bg-mask'></div>"
            }
        }
        if (n == false) {
            h += Mytv.getButtons(e, l, g, k)
        }
        var m = $("#middle-preview-panel");
        m.removeClass("datalist").addClass("mytvdata");
        var f = m.find(".info");
        if (f && f.length) {
            f.html(h);
            var b = m.find(".bg-image");
            var o = b.attr("src");
            var p = g.listBgUrl ? API.image_base_url + g.listBgUrl : "./resource/general/generic-container.jpg";
            if (p != o) {
                b.attr("src", p)
            }
        } else {
            h = "<div class='info'>" + h + "</div>";
            if (g.listBgUrl) {
                h += "<img class='bg-image' src='" + API.image_base_url + g.listBgUrl + "' onerror=\"this.onerror=null;this.src='./resource/general/generic-container.jpg'\"  alt=''>"
            } else {
                h += "<img class='bg-image' src='./resource/general/generic-container.jpg'  alt=''>"
            }
            h += "<div class='bg-mask'></div>";
            TVA.putInnerHTML(document.getElementById("middle-preview-panel"), h)
        }
        m.find(".bg-mask").remove();
        m.find(".bg-mask-disabled").remove();
        m.append(j);
        Mytv.checkButtons();
        TVA.invalidate()
    },
    loadInfo: function(a) {
        if (a) {
            Mytv.currentInfoLoaded = a;
            API.getMyTVProgramDetails(a)
        }
    },
    keyHandler: function(a) {
        if (View.actualFocus == "left-panel") {
            LeftPanel.keyHandler(a)
        }
    },
    setStatus: function(a, e) {
        if (a) {
            var d = a.find("img");
            if (d && d.length) {
                var f = d.attr("src");
                var c = f;
                if (e == true) {
                    f = f.replace("-off", "-on")
                } else {
                    f = f.replace("-on", "-off")
                }
                if (f != c) {
                    d.attr("src", f)
                }
            }
        }
    },
    moveFocus: function(c, i, f) {
        try {
            if (c == 0 && Mytv.buttonsPosition == -1 && f !== true) {
                return
            }
            var b = $(".mytv-button-1");
            var a = $(".mytv-button-2");
            if (!b.length) {
                return
            }
            var d = b.html();
            var h = a && a.length ? a.html() : "";
            if (c < 0 || c > 0) {
                if (TVA.OTT.LIST_FOCUS_OVER_PLAY == false) {
                    Mytv.buttonsPosition += c;
                    if (Mytv.buttonsPosition <= -2) {
                        Mytv.buttonsPosition = (h == "") ? 0 : 1
                    } else {
                        if (Mytv.buttonsPosition >= 2) {
                            Mytv.buttonsPosition = -1
                        }
                    }
                    if (h == "" && Mytv.buttonsPosition >= 1) {
                        Mytv.buttonsPosition = -1
                    }
                    switch (Mytv.buttonsPosition) {
                        case -1:
                            Mytv.setStatus(b, false);
                            Mytv.setStatus(a, false);
                            break;
                        case 0:
                            Mytv.setStatus(b, true);
                            Mytv.setStatus(a, false);
                            break;
                        case 1:
                            Mytv.setStatus(b, false);
                            Mytv.setStatus(a, true);
                            break
                    }
                } else {
                    if (d.indexOf("-on") > 0 && h != "") {
                        Mytv.setStatus(b, false);
                        Mytv.setStatus(a, true);
                        Mytv.buttonsPosition = 1
                    } else {
                        Mytv.setStatus(b, true);
                        Mytv.setStatus(a, false);
                        Mytv.buttonsPosition = 0
                    }
                }
            } else {
                if (i > 0 && i < 3) {
                    if (i == 2 && h != "") {
                        Mytv.setStatus(b, false);
                        Mytv.setStatus(a, true);
                        Mytv.buttonsPosition = 1
                    } else {
                        Mytv.setStatus(b, true);
                        Mytv.setStatus(a, false);
                        Mytv.buttonsPosition = 0
                    }
                } else {
                    if (i == -1 && (TVA.OTT.LIST_FOCUS_OVER_PLAY == false)) {
                        Mytv.setStatus(b, false);
                        Mytv.setStatus(a, false);
                        Mytv.buttonsPosition = -1
                    }
                }
            }
            Mytv.checkButtons()
        } catch (g) {}
    },
    checkButtons: function() {
        if (Mytv.playEnabled == true && Mytv.buttonsPosition == 0 && Footer.leftMethods.hasOwnProperty(TVA.tvKey.KEY_ENTER)) {
            $(".leftFooterButton-" + TVA.tvKey.KEY_ENTER).removeClass("disabled")
        } else {
            $(".leftFooterButton-" + TVA.tvKey.KEY_ENTER).addClass("disabled")
        }
        var a = $("#middle-preview-panel").find(".mytv-button-verficha");
        if (!a || (a && !a.length)) {
            $(".leftFooterButton-" + TVA.tvKey.KEY_1).html("Votar")
        } else {
            $(".leftFooterButton-" + TVA.tvKey.KEY_1).html("Ficha")
        }
    },
    clickButton: function(d) {
        Mytv.moveFocus(0, d, true);
        if (d == 3) {
            var c = $($("#left-panel-list").find("li.displayed")[LeftPanel.actualItem]);
            var b = c.data("programId");
            if (b) {
                var a = DataStore.get(Type.Program, b);
                PopUp.setVotingDetails(b, a.userVote);
                PopUp.showMe("voting", false, "");
                View.changeView(PopUp)
            }
            return
        }
        LeftPanel.keyHandler(TVA.tvKey.KEY_ENTER)
    }
};
var Storefront = {
    classname: "storefront",
    mode: "123456789",
    pageIdx: -1,
    currentFilters: null,
    currentChannels: null,
    maxChannels: 0,
    actualItem: [],
    actualRow: [],
    nextRow: [],
    itemRow: [],
    gridPanelUnhideTimeout: 0,
    initView: function() {
        TVA.putInnerHTML(document.getElementById("middle-preview-panel"), "");
        Header.actualPage = Storefront.pageIdx;
        GridPanel.footerLoaded = false;
        var a = [];
        Footer.setLeft(a);
        LeftPanel.init({
            mytv: false,
            displayItems: 12,
            scrollLimit: 6,
            title: false,
            actualPos: false,
            classC: "side-panel-series-movies"
        });
        $("#content-multi-panel").removeClass("hide-this");
        clearTimeout(this.gridPanelUnhideTimeout);
        this.gridPanelUnhideTimeout = 0;
        $("#grid-panel-right").addClass("hide-this");
        Storefront.buildPage(1);
        LeftPanel.hideMe(false);
        Storefront.setFocus();
        $("#multi-panel").removeClass("hide-this");
        View.loaderHide();
        $("#prev-big-slider").addClass("hide-this");
        $("#next-big-slider").addClass("hide-this");
        $("#sliders").addClass("hide-this");
        $("#epg").addClass("hide-this");
        $("#small-slider-vertical").addClass("hide-this")
    },
    deInitView: function() {
        clearTimeout(this.gridPanelUnhideTimeout);
        this.gridPanelUnhideTimeout = 0;
        $("#multi-panel").addClass("hide-this");
        TVA.putInnerHTML(document.getElementById("left-panel-list"), "");
        TVA.putInnerHTML(document.getElementById("scroll-grid-container"), "");
        for (var a = 0; a < Storefront.maxChannels; a++) {
            TVA.putInnerHTML(document.getElementById("channel_items_count" + a), "");
            TVA.putInnerHTML(document.getElementById("grid-row-series" + a), "")
        }
        Storefront.maxChannels = 0;
        LeftPanel.hideMe(true);
        LeftPanel.reset();
        GridPanel.hideMe(true);
        GridPanel.reset();
        SidePanel.hideMe(true);
        SidePanel.reset();
        Commons.offFocus(View.actualFocus);
        Commons.offHover(View.actualHover);
        GridPanel.footerLoaded = false
    },
    setFocus: function() {
        GridPanel.footerLoaded = false;
        if (View.actualFocus == "popup-message-container") {
            if (View.lostFocus !== null && View.lostHover !== null) {
                Commons.offFocus(View.actualFocus);
                Commons.offHover(View.actualHover);
                Commons.setFocus(View.lostFocus);
                Commons.setHover(View.lostHover);
                View.lostFocus = null;
                View.lostHover = null;
                return
            }
        }
        LeftPanel.setFocus()
    },
    buildPage: function(d, c, o, p) {
        if (d === 1) {
            Storefront.currentFilters = null;
            Storefront.currentChannels = null;
            API.getStorefrontFilters(Storefront.mode)
        } else {
            if (d === 2) {
                var h = 0;
                if (Storefront.fromHistory == true) {
                    h = parseInt(Storefront.actualItem[Storefront.mode]);
                    if (isNaN(h) || h < 0 || h >= c.length) {
                        h = 0
                    }
                }
                Storefront.currentFilters = c;
                Storefront.buildFilters(c);
                var n = h;
                if (n > 0) {
                    LeftPanel.hideMe(false);
                    var f = $("#left-panel-list");
                    var m = f.find("li");
                    var e = m.height();
                    var k = e * n;
                    var b = k;
                    var l = f.parent().height();
                    var j = f.height() - k;
                    if (j < l) {
                        k -= (l - j)
                    }
                    var a = (b - k) / e;
                    if (a < LeftPanel.scrollLimit) {
                        k -= ((LeftPanel.scrollLimit - a) * e)
                    }
                    if (k < 0) {
                        k = 0
                    }
                    LeftPanel.actualItem = n;
                    LeftPanel.visibleItem = (b - k) / e;
                    f.css("top", -k)
                }
                LeftPanel.setFocus();
                LeftPanel.applyFilter()
            } else {
                if (d === 3) {
                    Storefront.currentChannels = c;
                    Storefront.buildChannels(c);
                    for (var g = 0; g < 3 && g < c.length; g++) {
                        API.getStorefrontContent(Storefront.mode, o, c[g]["id"], g, p);
                        c[g]["id"] = ""
                    }
                    Storefront.args = {
                        htmlIndex: o,
                        param1: c,
                        arg: p
                    }
                } else {
                    if (d === 4) {
                        Storefront.buildPrograms(o, c)
                    }
                }
            }
        }
        TVA.invalidate()
    },
    buildFilters: function(d) {
        var b = "";
        for (var a = 0; a < d.length; a++) {
            var c = d[a];
            b += "<li id='left-panel-option" + a + "' class='displayed' data-filterKey='" + c.op + "' data-filterArg='" + c.arg + "' onmouseover='LeftPanel.hoverTo(" + a + ");' onclick='LeftPanel.keyHandler(TVA.tvKey.KEY_ENTER);'>" + c.text + "</li>"
        }
        TVA.putInnerHTML(document.getElementById("left-panel-list"), b);
        LeftPanel.setFocus()
    },
    buildChannels: function(a) {
        GridPanel.reset();
        var c = "";
        for (var b = 0; b < a.length; b++) {
            var d = a[b];
            c += "<div id='grid-row" + b + "' class='grid-row' onmouseover='$(this).addClass(\"active\");' onmouseout='$(this).removeClass(\"active\");'><span class='prev' onmouseover='GridPanel.setHover(this.id," + b + ");' onmouseout='GridPanel.offHover(this.id," + b + ");' onclick='GridPanel.left(true);'></span><span class='next' onmouseover='GridPanel.setHover(this.id," + b + ");' onmouseout='GridPanel.offHover(this.id," + b + ");' onclick='GridPanel.right(true);'></span><div class='info'><h1 class='channel on-parent-hover-green'>" + d.name + "</h1><div id='channel_items_count" + b + "' class='list-count'></div></div><div class='row-scroller'><ul id='grid-row-series" + b + "' class='grid-row-list'></ul></div></div>"
        }
        TVA.putInnerHTML(document.getElementById("scroll-grid-container"), c)
    },
    buildPrograms: function(j, c) {
        var k = "";
        var m = 0;
        var a = 1;
        if (Storefront.fromHistory == true) {
            m = parseInt(Storefront.actualRow[Storefront.mode]);
            a = parseInt(Storefront.nextRow[Storefront.mode]);
            if (isNaN(m)) {
                m = 0
            }
            if (isNaN(a)) {
                a = 1
            }
        }
        for (var q = 0; q < c.length; q++) {
            var p = c[q];
            var g = DataStore.get("Program", p.program);
            var b = typeof c[q]["asset"] != "undefined" && c[q]["asset"] !== null;
            var h = "";
            var l = "resource/";
            if (g.coverUrl != null) {
                if (j == m || j == a) {
                    h = "<img class='storefront-img-slider' src='" + l + "general/empty.png' data-coverurl='" + API.image_base_url + g.coverUrl + "' alt=''/>"
                } else {
                    h = "<img class='storefront-img-slider' src='" + l + "general/empty.png' data-coverurl='" + API.image_base_url + g.coverUrl + "' alt=''/>"
                }
            } else {
                h = "<img class='storefront-img-slider' src='" + l + "general/empty.png' alt=''/>"
            }
            var d = /T.[0-9]+/gi;
            var u = g.title.replace(d, "");
            var o = (g.season) ? "<div class='show-season'><div class='season'>T." + g.season + "</div></div>" : "";
            var t = '<div class="thumb-icon-list">';
            if (b) {
                t += '<img src="' + l + 'general/empty.png" class="thumb-icon-storefront thumb-icon-storefront-play" />'
            } else {
                t += '<img src="' + l + 'general/empty.png" class="thumb-icon-storefront thumb-icon-storefront-rec" />'
            }
            t += "</div>";
            k += "<li id='grid-item-" + j + "-" + q + "' data-programId='" + g.id + "' data-channelId='" + p.channel + "' data-eventId='" + (p.event ? p.event : "") + "' data-assetMatchesProgram='" + (p.assetMatchesProgram ? "1" : "0") + "' data-assetId='" + (b ? c[q]["asset"] : "") + "'' onmouseover='GridPanel.hoverTo(" + j + ", " + q + ");' onmouseout='Commons.offHover(this.id);' onclick='GridPanel.moreInfo(TVA.tvKey.KEY_ENTER);'> <div class='bg-default-caratulas'></div>" + h + t + "<h3 class='name'>" + u + "</h3>" + o + "</li>"
        }
        if (c) {
            TVA.putInnerHTML(document.getElementById("channel_items_count" + j), "<span id='channel_current_item" + j + "' class='on-parent-hover-green'>1</span> de " + c.length);
            TVA.putInnerHTML(document.getElementById("grid-row-series" + j), k)
        }
        if (j > Storefront.maxChannels) {
            Storefront.maxChannels = j
        }
        try {
            if (m == j && m < Storefront.currentChannels.length) {
                GridPanel.hideMe(false);
                if (Storefront.fromHistory == true && TVA.OTT.DEVICETYPE != TVA.OTT.DEVICETYPE_BRAVIA) {
                    GridPanel.setFocus();
                    while (m-- > 0) {
                        GridPanel.down(false)
                    }
                    if (Storefront.actualRow[Storefront.mode] < Storefront.nextRow[Storefront.mode]) {
                        var n = $("#grid-panel-right");
                        var r = $("#grid-row" + GridPanel.row);
                        if (r.offset().top - n.offset().top >= r.height()) {
                            GridPanel.down(false);
                            GridPanel.up(false)
                        }
                    }
                    var f = Storefront.itemRow[Storefront.mode];
                    while (f-- > 0) {
                        GridPanel.right()
                    }
                    View.actualFocus = "grid-panel-right";
                    GridPanel.checkImages(true)
                }
            } else {
                this.gridPanelUnhideTimeout = setTimeout("GridPanel.hideMe(false);", 2000)
            }
        } catch (s) {}
        if (Storefront.currentChannels && (j == 0 || j == 1)) {
            GridPanel.checkImages()
        }
    },
    keyHandler: function(a) {
        if (View.actualFocus == "left-panel") {
            if (LeftPanel.keyHandler(a) == true) {
                Storefront.fromHistory = false
            }
        } else {
            if (View.actualFocus == "grid-panel-right") {
                GridPanel.keyHandler(a)
            }
        }
    },
    moreInfo: function() {
        Storefront.actualItem[Storefront.mode] = LeftPanel.actualItem;
        var a = $("#grid-panel-right");
        var b = $("#grid-row" + GridPanel.row);
        if (b.offset().top - a.offset().top < b.height()) {
            Storefront.actualRow[Storefront.mode] = GridPanel.row;
            Storefront.nextRow[Storefront.mode] = GridPanel.row + 1
        } else {
            Storefront.actualRow[Storefront.mode] = GridPanel.row;
            Storefront.nextRow[Storefront.mode] = GridPanel.row - 1
        }
        Storefront.itemRow[Storefront.mode] = GridPanel.item[GridPanel.row]
    }
};
var TotalStore = {
    classname: "totalstore",
    options: [],
    initView: function() {
        TVA.putInnerHTML(document.getElementById("middle-preview-panel"), "");
        Header.actualPage = 9;
        $("#left-panel-title").html("");
        var a = [];
        Footer.setLeft(a);
        Footer.disableLeft();
        LeftPanel.init({
            mytv: false,
            displayItems: 5,
            scrollLimit: 4,
            title: true,
            actualPos: true,
            classC: "side-panel-mytv"
        });
        LeftPanel.hideMe(false);
        $("#content-multi-panel").removeClass("hide-this");
        $("#multi-panel").removeClass("hide-this");
        $("#small-slider-vertical").addClass("hide-this");
        MidPanel.hideMe(false);
        View.loaderHide();
        $("#prev-big-slider").addClass("hide-this");
        $("#next-big-slider").addClass("hide-this");
        $("#sliders").addClass("hide-this");
        $("#epg").addClass("hide-this");
        $(".preview-panel").addClass("totalstore-middle-planel-preview");
        TVA.putInnerHTML(document.getElementById("middle-preview-panel"), "");
        $("#left-panel-scroll-down").addClass("totalstore-scroll-down");
        $("#left-panel-scroll-up").addClass("totalstore-scroll-up");
        this.buildLeftPanel()
    },
    buildLeftPanel: function() {
        var e = "";
        if (this.options && this.options.length > 0) {
            var d = 0;
            for (var c in this.options) {
                if (this.options.hasOwnProperty(c)) {
                    var f = this.options[c];
                    var b = f.name;
                    var a = 0;
                    if (f.name) {
                        a++
                    }
                    if (f.tagLine1) {
                        b += "<div class='left-panel-tagline1' >" + f.tagLine1 + "</div>";
                        a++
                    }
                    if (f.tagLine2) {
                        b += "<div class='left-panel-tagline2' >" + f.tagLine2 + "</div>";
                        a++
                    }
                    if (a < 2) {
                        b = "<div class='left-panel-div-1' >" + b + "</div>"
                    } else {
                        if (a < 3) {
                            b = "<div class='left-panel-div-2' >" + b + "</div>"
                        } else {
                            b = "<div class='left-panel-div-3' >" + b + "</div>"
                        }
                    }
                    if (f.logoUrl) {
                        b = "<div class='totalstore-logo'><img src='" + f.logoUrl + "'></div>" + b
                    }
                    e += '<li id="left-panel-option' + d + '" class="itemTV displayed totalstore-option" data-itemId="id_' + c + '" onmouseover="LeftPanel.hoverTo(' + d + ', -1);" >' + b + "</li>";
                    d++
                }
            }
        } else {
            PopMsg.show("info", 44)
        }
        TVA.putInnerHTML(document.getElementById("left-panel-list"), e);
        $("#left-panel-actual-pos").hide();
        TVA.putInnerHTML(document.getElementById("current-item-left-panel"), "");
        this.setFocus()
    },
    deInitView: function() {
        TVA.putInnerHTML(document.getElementById("middle-preview-panel"), "");
        $(".preview-panel").removeClass("totalstore-middle-planel-preview");
        $("#left-panel-scroll-down").removeClass("totalstore-scroll-down");
        $("#left-panel-scroll-up").removeClass("totalstore-scroll-up")
    },
    setFocus: function() {
        LeftPanel.setFocus()
    },
    loadInfo: function(c) {
        var a = "";
        var b = this.options[c.replace("id_", "")];
        a += "<div class='info'>";
        if (b.description) {
            a += "<h1 id='mytv-program-name' class='series'>" + b.description;
            if (b.description2) {
                a += "<span class='span-separator'></span>" + b.description2
            }
            a += "</h1>"
        }
        if (b.description3) {
            a += "<h3 class='description'>" + b.description3 + "</h3>"
        }
        a += "</div>";
        if (b.backgroundUrl) {
            a += "<img class='bg-image' src='" + b.backgroundUrl + "' onerror=\"this.onerror=null;this.src='./resource/general/generic-container.jpg'\"  alt=''>"
        } else {
            a += "<img class='bg-image' src='./resource/general/generic-container.jpg'  alt=''>"
        }
        TVA.putInnerHTML(document.getElementById("middle-preview-panel"), a);
        TVA.invalidate()
    },
    keyHandler: function(a) {
        switch (a) {
            case TVA.tvKey.KEY_ENTER:
            case TVA.tvKey.KEY_1:
                return true
        }
        return LeftPanel.keyHandler(a)
    }
};
var EPG = {
    classname: "epg",
    currentDayOffset: 0,
    channelIDList: [],
    channelInfoList: [],
    prevFocus: null,
    currentDetails: null,
    initView: function(fromPage) {
        TVA.putInnerHTML(document.getElementById("middle-preview-panel"), "");
        Header.actualPage = 2;
        var footerElements = [];
        footerElements.push({
            text: "Ver",
            className: "enter-button-footer",
            disabled: true,
            keycode: TVA.tvKey.KEY_ENTER,
            method: function() {
                var el = $("#channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
                var details = {
                    programId: el.data("programId"),
                    eventId: el.data("eventId"),
                    channelId: el.data("channelId"),
                    assetId: el.data("assetId")
                };
                if (details.assetId && details.programId && details.channelId) {
                    EPG.goDataSheet()
                } else {
                    var ch = null;
                    if (details.eventId) {
                        var event = DataStore.get(Type.Event, el.data("eventId"));
                        if (event && !event.channel) {
                            return false
                        }
                        ch = event.channel
                    }
                    if (!ch || ch == null || ch == "null") {
                        try {
                            var oc = $($("#channel-vertical-scroll").find(".epg-channel")[ProgramGrid.actualChannel]).attr("onclick");
                            if (oc) {
                                eval(oc);
                                return false
                            }
                        } catch (e) {}
                    }
                    if (ch && ch !== null && ch !== "null") {
                        API.getChannels("direct", 0, ch)
                    } else {
                        API.getChannels("direct", ProgramGrid.actualChannel)
                    }
                }
                return false
            }
        });
        footerElements.push({
            text: "Ficha",
            className: "one-button-footer",
            keycode: TVA.tvKey.KEY_1,
            method: function() {
                EPG.goDataSheet();
                return false
            }
        });
        footerElements.push({
            text: "Día -",
            className: "green-button-footer",
            keycode: TVA.tvKey.KEY_GREEN,
            method: function() {
                EPG.previousDay();
                return false
            }
        });
        footerElements.push({
            text: "Día +",
            className: "yellow-button-footer",
            keycode: TVA.tvKey.KEY_YELLOW,
            method: function() {
                EPG.nextDay();
                return false
            }
        });
        if (TVA.device != "ps3") {
            footerElements.push({
                text: "Pag +/-",
                className: "blue-button-footer",
                keycode: TVA.tvKey.KEY_BLUE,
                method: function() {
                    ProgramGrid.pageDown();
                    return false
                }
            })
        }
        Footer.setLeft(footerElements);
        if (fromPage !== null && typeof fromPage !== "undefined" && fromPage.classname && (fromPage.classname === "datasheet" || fromPage.classname === "datalist" || fromPage.classname === "videoplayer") && EPG.prevFocus != null) {
            ProgramGrid.hideMe(false);
            SidePanel.hideMe(false);
            if (EPG.prevFocus) {
                View.actualFocus = EPG.prevFocus.actualFocus;
                View.actualHover = EPG.prevFocus.actualHover;
                EPG.prevFocus = null;
                Commons.setFocus(View.actualFocus);
                Commons.setHover(View.actualHover);
                ProgramGrid.getProgramDetails()
            }
        } else {
            EPG.currentDayOffset = 0;
            API.getChannels("epg")
        }
        View.loaderHide();
        $("#prev-big-slider").addClass("hide-this");
        $("#next-big-slider").addClass("hide-this");
        $("#sliders").addClass("hide-this");
        $("#content-multi-panel").addClass("hide-this");
        $("#multi-panel").addClass("hide-this")
    },
    deInitView: function(a) {
        if (typeof a !== "undefined" && a.classname && (a.classname === "datasheet" || a.classname === "datalist" || a.classname === "videoplayer")) {
            ProgramGrid.hideMe(true);
            SidePanel.hideMe(true);
            EPG.prevFocus = {
                actualFocus: View.actualFocus,
                actualHover: View.actualHover
            };
            return
        }
        ProgramGrid.hideMe(true);
        ProgramGrid.init();
        Commons.offFocus(View.actualFocus);
        Commons.offHover(View.actualHover);
        SidePanel.hideMe(true);
        SidePanel.reset();
        $("#channel-vertical-scroll").css("top", 0);
        $("#epg-list-program").css("top", 0);
        TVA.putInnerHTML(document.getElementById("channel-vertical-scroll"), "");
        TVA.putInnerHTML(document.getElementById("epg-list-program"), "");
        TVA.putInnerHTML(document.getElementById("epg-info"), "")
    },
    setFocus: function() {
        ProgramGrid.setFocus()
    },
    nextDay: function() {
        if (EPG.currentDayOffset < 7) {
            EPG.currentDayOffset++;
            API.getEPGContent(EPG.currentDayOffset, EPG.channelIDList)
        }
    },
    previousDay: function() {
        if (EPG.currentDayOffset > -7) {
            EPG.currentDayOffset--;
            API.getEPGContent(EPG.currentDayOffset, EPG.channelIDList)
        }
    },
    buildChannelGrid: function(a) {
        var c = "";
        EPG.currentDayOffset = 0;
        EPG.channelIDList = [];
        EPG.channelInfoList = [];
        for (var b = 0; b < a.length; b++) {
            var d = a[b];
            var e = "" + d.logoUrl;
            c = "";
            var f = "onclick=\"API.getChannels('direct',0,'" + d.id + "');\" ";
            if (e == "" || e == "undefined" || e == "null") {
                c = "<div id='epg-channel-id-" + d.id + "' " + f + " class='epg-channel epg-channel-nobg'><div class='epg-channel-nobg-div'>" + d.name + "</div></div>"
            } else {
                c = "<div id='epg-channel-id-" + d.id + "' " + f + " class='epg-channel'><img src='" + API.image_base_url + e + "' alt='" + d.name + "'></div>"
            }
            EPG.channelInfoList[d.id] = c;
            EPG.channelIDList.push(d.id)
        }
        API.getEPGContent(EPG.currentDayOffset, EPG.channelIDList)
    },
    buildGridContent: function(p, l) {
        $("#date-epg").html(l.getDate() + "/" + (l.getMonth() + 1));
        var k = "";
        var g = "";
        for (var s = 0; s < p.length; s++) {
            var w = p[s];
            g += EPG.channelInfoList[w.id];
            k += "<div id='channelId" + s + "' class='epg-row'>";
            for (var q = 0; q < w.events.length; q++) {
                var r = DataStore.get(Type.Event, w.events[q]);
                var d = r.startTime;
                var h = d.getDate();
                var m = d.getHours();
                var a = d.getMinutes();
                var t = r.endTime;
                var e = t.getDate();
                var f = t.getHours();
                var n = t.getMinutes();
                var v = l.getDate();
                var c;
                var o;
                if (h === v) {
                    c = (m * 60 + a) * 4;
                    if (e === v) {
                        o = Utils.getSecondsBetweenDates(d, t) / 60
                    } else {
                        var b = new Date(d.getTime());
                        b.setHours(24, 0, 0);
                        o = Utils.getSecondsBetweenDates(d, b) / 60
                    }
                    o *= 4
                } else {
                    c = 0;
                    o = f * 60 + n;
                    o *= 4
                }
                if (o - 12 > 0) {
                    o -= 12
                }
                var u = c + (o / 2);
                k += "<div class='epg-item' id='channelId" + s + "-" + q + "' style='left:" + c + "px; width:" + o + "px' data-eventId='" + r.id + "' data-index='" + q + "' data-posCenter='" + u + "' onmouseover=\"ProgramGrid.setHover(" + s + "," + q + ");\" onclick='EPG.click(" + s + ", " + q + ");'><div class='left-border'></div><div class='right-border'></div><div class='center-border'><div class='item-text'><h2 style='width:" + (o - 18) + "px'>" + r.title + "</h2></div></div></div>"
            }
            k += "</div>"
        }
        TVA.putInnerHTML(document.getElementById("channel-vertical-scroll"), g);
        TVA.putInnerHTML(document.getElementById("epg-list-program"), k);
        ProgramGrid.setFocus()
    },
    click: function(a, b) {
        if ($(".leftFooterButton-" + TVA.tvKey.KEY_ENTER).hasClass("disabled") == false) {
            Footer.keyHandler(TVA.tvKey.KEY_ENTER)
        } else {
            if (ProgramGrid.actualChannel != a || ProgramGrid.itemRow != b) {
                ProgramGrid.actualChannel = a;
                ProgramGrid.itemRow = b;
                ProgramGrid.getProgramDetails(true);
                Commons.setHover("channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
                ProgramGrid.scrollLeft()
            } else {
                ProgramGrid.keyHandler(TVA.tvKey.KEY_ENTER)
            }
        }
        return false
    },
    buildDetails: function(c) {
        clearTimeout(ProgramGrid.detailsTimeout);
        ProgramGrid.detailsTimeout = null;
        EPG.currentDetails = c;
        var g = DataStore.get(Type.Program, c.program);
        var d = false;
        var l = false;
        var f = false;
        var k = false;
        var o = "&nbsp;";
        var j = "&nbsp;";
        if (c.event) {
            d = DataStore.get(Type.Event, c.event);
            l = DataStore.get(Type.Channel, d.channel);
            f = d.startTime;
            k = d.endTime;
            o = l.name;
            j = Utils.weekday[f.getDay()] + " " + f.getDate() + " de " + Utils.month[f.getMonth()] + "  " + Utils.checkTimeStr(f.getHours()) + ":" + Utils.checkTimeStr(f.getMinutes()) + " - " + Utils.checkTimeStr(k.getHours()) + ":" + Utils.checkTimeStr(k.getMinutes())
        }
        var e = "";
        if (g.season) {
            e = "T" + g.season;
            if (g.episodePartial) {
                e += " Ep. " + g.episodePartial
            }
            e += " | "
        }
        var m = 0;
        if (g.usersReview) {
            m = Math.round(g.usersReview)
        }
        var h = "";
        h += '<span class="channel green">' + o + '</span><h1 class="series">' + g.title + '</h1><h2 class="chapter">' + ((g.episodeTitle) ? g.episodeTitle : "&nbsp;") + '</h2><h3 class="description">' + e + j + '</h3><h3 class="user-votes">Votos Usuarios<span class="stars stars' + m + '"></span></h3>' + DataSheet.buildIconHTML(g, d);
        var b = $(".epg .bg-image");
        if (g.backgroundUrl != null) {
            b.hide().attr("src", API.image_base_url + (g.backgroundUrl))
        } else {
            b.hide().attr("src", "resource/general/empty.png")
        }
        TVA.putInnerHTML(document.getElementById("epg-info"), h);
        TVA.invalidate();
        var n = $(".leftFooterButton-" + TVA.tvKey.KEY_ENTER);
        var i = $("#epg-ver-div");
        if (c.asset && c.program && c.channel) {
            var p = $("#channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
            var a = p.data("eventId");
            if (d.id == a) {
                p.data("assetId", c.asset);
                p.data("programId", c.program);
                p.data("channelId", c.channel)
            }
            n.removeClass("disabled")
        }
        if (n.hasClass("disabled") == false) {
            i.removeClass("hide-this")
        } else {
            i.addClass("hide-this")
        }
    },
    keyHandler: function(a) {
        ProgramGrid.keyHandler(a)
    },
    goDataSheet: function() {
        if (ProgramGrid.detailsTimeout != null) {
            return
        }
        var d = $("#channelId" + ProgramGrid.actualChannel + "-" + ProgramGrid.itemRow);
        var c = d.data("eventId");
        var a = DataStore.get(Type.Program, EPG.currentDetails.program);
        var e = DataStore.get(Type.Event, c);
        if (a.parent) {
            var b = DataStore.get(Type.Program, a.parent);
            if (b && b.isGroup === true) {
                var f = "-";
                if (d && d.data("assetId") && d.data("assetId") != "null" && d.data("assetId") != null) {
                    f = d.data("assetId")
                }
                var g = {
                    programId: (a ? a.id : ""),
                    eventId: (e ? e.id : ""),
                    channelId: (e.channel && e.channel["id"] ? e.channel["id"] : ""),
                    parentId: (a ? a.parent : ""),
                    assetId: f,
                    program: b,
                    programNode: a,
                    finfo: {
                        programId: (a ? a.id : ""),
                        assetId: f,
                        eventId: (e ? e.id : "")
                    }
                };
                DataList.setDetails(g, g.finfo);
                View.changeView(DataList);
                return
            }
        }
        c = d.data("eventId");
        if (c) {
            DataSheet.setDetails(null, c);
            View.changeView(DataSheet)
        }
    }
};
var PopUp = {
    classname: "popup",
    type: "",
    time: false,
    callback: null,
    isVisible: false,
    pairingCode: "",
    previousHover: "",
    text: "",
    deInitTimeout: null,
    initView: function() {
        Commons.setFocus("popup-message-container");
        View.loaderHide()
    },
    showMe: function(b, c, d) {
        View.loaderHide();
        if (View.actualPageIs(PopUp) && PopUp.type == "pairing" && b == "error") {
            if (PopMsg.getText(5) == d || PopMsg.getText(47) == d) {
                return
            }
        }
        if (typeof d === "string") {
            d = d.replace(/\n/g, "<br/>")
        }
        if (b == "pairing") {
            PopUp.text = d
        }
        TVA.putInnerHTML(document.getElementById("popup-message-text"), d);
        PopUp.time = c;
        PopUp.type = b;
        PopUp.setFocus();
        PopUp.isVisible = true;
        PopUp.pairingCode = "";
        var a = $("#pairing-codes");
        a.addClass("hide-this");
        if (PopUp.type == "pairing" && $(".header-menu-last").html() != "VINCULAR") {
            PopUp.loadPairing(true)
        } else {
            if (PopUp.type == "pairing") {
                a.removeClass("hide-this")
            }
            $("#popup-message-container").removeClass("hide-this");
            PopUp.showMessagesContainer();
            $("#messages-frame").addClass("hide-this")
        }
        if (c) {
            PopUp.startHideTimeout(7)
        }
    },
    startHideTimeout: function(a) {
        clearTimeout(PopUp.deInitTimeout);
        PopUp.deInitTimeout = setTimeout(function() {
            PopUp.deInitView()
        }, a * 1000)
    },
    setCallback: function(a) {
        PopUp.callback = a
    },
    deInitView: function() {
        clearTimeout(PopUp.deInitTimeout);
        PopUp.time = false;
        PopUp.type = "";
        PopUp.hideMessagesContainer();
        $("#messages-frame").addClass("hide-this");
        $("#pairing-codes").addClass("hide-this");
        $("#voting").addClass("hide-this");
        $("#messages-actions").addClass("hide-this");
        $(".option-button").addClass("hide-this");
        Commons.offFocus(View.actualFocus);
        Commons.offHover(View.actualHover);
        if (View.tempPage) {
            View.actualPage = View.tempPage
        }
        if (!View.actualPage) {
            View.tempPage = Home;
            View.actualPage = View.tempPage
        }
        View.actualPage.setFocus();
        PopUp.callback = null;
        PopUp.isVisible = false;
        PopUp.pairingCode = "";
        clearInterval(API.pairingTimeout);
        API.pairingTimeout = null;
        Header.checkActive();
        if (TVA.OTT.CLOSE_CHLIST == false && SidePanel.isVisible()) {
            SidePanel.setFocus()
        }
    },
    setFocus: function() {
        Commons.setFocus("popup-message-container");
        Commons.offHover(View.actualHover);
        $(".option-button").addClass("hide-this");
        var m = $(".messages-icon");
        var e = $("#messages-image-left");
        var c = $("#messages-image-right");
        var a = $("#popup-message-container");
        var n = $("#option1-popup-message");
        var l = $("#option2-popup-message");
        var k = $("#option3-popup-message");
        var f = $("#ok-popup-message");
        var p = $("#cancel-popup-message");
        var o = $("#messages-image");
        var g = $(".messages-actions");
        g.removeClass("messages-actions-help");
        m.removeClass("hide-this");
        k.addClass("hide-this");
        o.addClass("hide-this");
        e.addClass("hide-this");
        c.addClass("hide-this");
        a.removeClass("popup-message-container-fullscreen");
        PopUp.setStep(0, 0);
        var j = false;
        var d = $("#voting");
        d.addClass("hide-this");
        if (PopUp.type == "ok") {
            a.removeClass().addClass("message ok-message");
            f.removeClass("hide-this");
            p.addClass("hide-this");
            Commons.setHover("ok-popup-message")
        } else {
            if (PopUp.type == "delete") {
                a.removeClass().addClass("message delete-message");
                f.removeClass("hide-this");
                p.removeClass("hide-this");
                Commons.setHover("ok-popup-message")
            } else {
                if (PopUp.type == "error") {
                    a.removeClass().addClass("message error-message");
                    f.removeClass("hide-this");
                    p.addClass("hide-this");
                    Commons.setHover("ok-popup-message")
                } else {
                    if (PopUp.type == "interrogation") {
                        a.removeClass().addClass("message interrogation-message");
                        f.removeClass("hide-this");
                        p.addClass("hide-this");
                        Commons.setHover("ok-popup-message")
                    } else {
                        if (PopUp.type == "info") {
                            a.removeClass().addClass("message info-message");
                            f.removeClass("hide-this");
                            p.addClass("hide-this");
                            Commons.setHover("ok-popup-message")
                        } else {
                            if (PopUp.type == "pairing") {
                                if ($(".header-menu-last").html() != "VINCULAR") {
                                    $("#popup-message-focus").removeClass().addClass("message pairing-message");
                                    $("#pairing-codes").removeClass("hide-this");
                                    Commons.setHover("login-alta")
                                } else {
                                    a.removeClass().addClass("message pairing-message");
                                    $("#pairing-codes").removeClass("hide-this");
                                    f.addClass("hide-this");
                                    p.removeClass("hide-this");
                                    Commons.setHover("cancel-popup-message")
                                }
                            } else {
                                if (PopUp.type == "voting") {
                                    a.removeClass().addClass("message voting-message");
                                    d.removeClass("hide-this");
                                    f.removeClass("hide-this");
                                    p.removeClass("hide-this");
                                    Commons.setHover("voting-stars")
                                } else {
                                    if (PopUp.type == "playfrom") {
                                        a.removeClass().addClass("message info-message");
                                        f.addClass("hide-this");
                                        n.removeClass("hide-this").html("Ver desde donde lo dejé");
                                        l.removeClass("hide-this").html("Ver desde el principio");
                                        p.removeClass("hide-this");
                                        Commons.setHover("option1-popup-message")
                                    } else {
                                        if (PopUp.type == "direct-start") {
                                            a.removeClass().addClass("message info-message");
                                            f.addClass("hide-this");
                                            n.removeClass("hide-this").html("OK");
                                            l.removeClass("hide-this").html("No mostrar de nuevo");
                                            p.addClass("hide-this");
                                            Commons.setHover("option1-popup-message");
                                            j = true
                                        } else {
                                            if (PopUp.type == "tutorial") {
                                                a.removeClass().addClass("message info-message");
                                                a.addClass("popup-message-container-fullscreen");
                                                m.addClass("hide-this");
                                                f.addClass("hide-this");
                                                PopUp.tutorialCurrentPosition = 1;
                                                n.addClass("hide-this");
                                                l.addClass("hide-this");
                                                k.addClass("hide-this");
                                                p.addClass("hide-this");
                                                e.addClass("hide-this");
                                                c.removeClass("hide-this");
                                                g.addClass("messages-actions-help");
                                                PopUp.setStep(PopUp.tutorialCurrentPosition, PopUp.tutorial.length);
                                                o.removeClass("hide-this").css("background-image", 'url("' + PopUp.tutorial[PopUp.tutorialCurrentPosition - 1] + '")');
                                                Commons.setHover("option1-popup-message");
                                                j = true
                                            } else {
                                                if (PopUp.type == "recording-chapter" || PopUp.type == "recording-serie") {
                                                    a.removeClass().addClass("message info-message");
                                                    f.addClass("hide-this");
                                                    n.removeClass("hide-this").html("Grabar Serie");
                                                    if (PopUp.type == "recording-chapter") {
                                                        l.removeClass("hide-this").html("Grabar Capitulo")
                                                    } else {
                                                        l.addClass("hide-this")
                                                    }
                                                    p.removeClass("hide-this");
                                                    Commons.setHover("option1-popup-message")
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        var b = $("#messages-actions");
        if (!PopUp.time) {
            b.removeClass("hide-this")
        } else {
            b.addClass("hide-this")
        }
        var i = $("#messages-container");
        var h = i.find("#popup-message-container");
        if (j == true) {
            i.addClass("messages-nobg");
            h.addClass("messages-div-bg")
        } else {
            i.removeClass("messages-nobg");
            h.removeClass("messages-div-bg")
        }
        a.removeClass("hide-this")
    },
    setCode: function(c) {
        if (c.length > 0) {
            var b = "";
            for (var a = 0; a < c.length; a++) {
                b += '<span id="pair-num' + a + '" class="pairing-num">' + c[a] + "</span>"
            }
            TVA.putInnerHTML(document.getElementById("pairing-codes"), b);
            PopUp.pairingCode = c
        }
    },
    updateCode: function() {
        if (document.getElementById("codigoactivacion") && PopUp.pairingCode.length > 0) {
            var b = "";
            var d = PopUp.pairingCode;
            for (var a = 0; a < d.length; a++) {
                b += "<li>" + d[a] + "</li>"
            }
            TVA.putInnerHTML(document.getElementById("codigoactivacion"), b);
            if (d.length < 6) {
                var c = $(".codigoactivaciondiv");
                var e = c.width();
                c.width(Math.round(e * d.length / 6) + "px")
            }
        }
    },
    setVotingDetails: function(c, a) {
        var b = $("#voting-stars-stars");
        if (a > 5 || a < 1) {
            a = 3
        }
        if (c) {
            b.data("programId", c)
        }
        b.data("stars", a).removeClass().addClass("stars stars" + a)
    },
    keyHandler: function(j) {
        var e = PopUp.callback;
        var k = "";
        var l = "";
        var n = $("#option1-popup-message");
        var m = $("#option2-popup-message");
        if (PopUp.type == "delete") {
            switch (j) {
                case TVA.tvKey.KEY_LEFT:
                    Commons.offHover(View.actualHover);
                    Commons.setHover("ok-popup-message");
                    break;
                case TVA.tvKey.KEY_RIGHT:
                    Commons.offHover(View.actualHover);
                    Commons.setHover("cancel-popup-message");
                    break;
                case TVA.tvKey.KEY_ENTER:
                    if (e) {
                        e(View.actualHover == "ok-popup-message")
                    }
                    PopUp.deInitView();
                    break;
                case TVA.tvKey.KEY_RETURN:
                    PopUp.deInitView();
                    break
            }
        } else {
            if (PopUp.type == "pairing") {
                if (j == TVA.tvKey.KEY_RETURN) {
                    if (API.auth == false) {
                        PopUp.deInitView()
                    } else {
                        TVA.handleReturn()
                    }
                } else {
                    if ($(".header-menu-last").html() != "VINCULAR") {
                        switch (j) {
                            case TVA.tvKey.KEY_LEFT:
                            case TVA.tvKey.KEY_UP:
                                Commons.offHover(View.actualHover);
                                Commons.setHover("login-alta");
                                break;
                            case TVA.tvKey.KEY_RIGHT:
                            case TVA.tvKey.KEY_DOWN:
                                Commons.offHover(View.actualHover);
                                Commons.setHover("login-login");
                                break;
                            case TVA.tvKey.KEY_ENTER:
                                if (View.actualHover == "login-alta" || View.actualHover == "login-login") {
                                    PopUp.goFrame(View.actualHover)
                                } else {}
                                break;
                            case TVA.tvKey.KEY_RETURN:
                                if (API.auth == false) {
                                    PopUp.deInitView()
                                } else {
                                    TVA.handleReturn()
                                }
                                break
                        }
                    } else {
                        if (j == TVA.tvKey.KEY_ENTER && !PopUp.time) {
                            if (API.auth == false) {
                                PopUp.deInitView()
                            } else {
                                TVA.handleReturn()
                            }
                        }
                    }
                }
            } else {
                if (PopUp.type == "pairing-login") {
                    PopUp.pairingHandler(j, false)
                } else {
                    if (PopUp.type == "pairing-alta") {
                        PopUp.pairingHandler(j, true)
                    } else {
                        if (PopUp.type == "playfrom") {
                            switch (j) {
                                case TVA.tvKey.KEY_LEFT:
                                    Commons.offHover(View.actualHover);
                                    if (View.actualHover == "option2-popup-message") {
                                        k = "option1-popup-message"
                                    } else {
                                        if (View.actualHover == "cancel-popup-message") {
                                            k = "option2-popup-message"
                                        } else {
                                            k = "cancel-popup-message"
                                        }
                                    }
                                    Commons.setHover(k);
                                    break;
                                case TVA.tvKey.KEY_RIGHT:
                                    Commons.offHover(View.actualHover);
                                    k = "option2-popup-message";
                                    if (View.actualHover == "option2-popup-message") {
                                        k = "cancel-popup-message"
                                    } else {
                                        if (View.actualHover == "cancel-popup-message") {
                                            k = "option1-popup-message"
                                        }
                                    }
                                    Commons.setHover(k);
                                    break;
                                case TVA.tvKey.KEY_ENTER:
                                    l = View.actualHover;
                                    PopUp.deInitView();
                                    if (e) {
                                        e(l)
                                    }
                                    break;
                                case TVA.tvKey.KEY_RETURN:
                                    PopUp.deInitView();
                                    if (e) {
                                        e("")
                                    }
                                    break
                            }
                            n.removeClass("hide-this").html("Ver desde donde lo dejé");
                            m.removeClass("hide-this").html("Ver desde el principio");
                            $("#cancel-popup-message").removeClass("hide-this")
                        } else {
                            if (PopUp.type == "direct-start") {
                                switch (j) {
                                    case TVA.tvKey.KEY_LEFT:
                                    case TVA.tvKey.KEY_RIGHT:
                                        Commons.offHover(View.actualHover);
                                        k = "option2-popup-message";
                                        if (View.actualHover == "option2-popup-message") {
                                            k = "option1-popup-message"
                                        }
                                        Commons.setHover(k);
                                        break;
                                    case TVA.tvKey.KEY_ENTER:
                                        var f = View.actualHover;
                                        PopUp.deInitView();
                                        if (e) {
                                            e(f == "option2-popup-message" ? 1 : 0)
                                        }
                                        break;
                                    case TVA.tvKey.KEY_RETURN:
                                        PopUp.deInitView();
                                        if (e) {
                                            e(0)
                                        }
                                        break
                                }
                            } else {
                                if (PopUp.type == "tutorial") {
                                    switch (j) {
                                        case TVA.tvKey.KEY_LEFT:
                                        case TVA.tvKey.KEY_RIGHT:
                                            if (m.hasClass("hide-this") == false) {
                                                Commons.offHover(View.actualHover);
                                                k = "option2-popup-message";
                                                if (View.actualHover == "option2-popup-message") {
                                                    if (j == TVA.tvKey.KEY_LEFT) {
                                                        k = "option1-popup-message"
                                                    } else {
                                                        k = "option3-popup-message"
                                                    }
                                                } else {
                                                    if (View.actualHover == "option3-popup-message") {
                                                        if (j == TVA.tvKey.KEY_LEFT) {
                                                            k = "option2-popup-message"
                                                        } else {
                                                            k = "option1-popup-message"
                                                        }
                                                    } else {
                                                        if (View.actualHover == "option1-popup-message") {
                                                            if (j == TVA.tvKey.KEY_LEFT) {
                                                                k = "option3-popup-message"
                                                            } else {
                                                                k = "option2-popup-message"
                                                            }
                                                        }
                                                    }
                                                }
                                                Commons.setHover(k);
                                                PopUp.checkTutorialScroll()
                                            } else {
                                                PopUp.tutorialMove(j == TVA.tvKey.KEY_LEFT ? -1 : +1)
                                            }
                                            break;
                                        case TVA.tvKey.KEY_ENTER:
                                            var d = n.hasClass("hide-this");
                                            if (d == false) {
                                                var i = View.actualHover;
                                                var g = (i == "option3-popup-message" ? 2 : i == "option2-popup-message" ? 1 : 0);
                                                if (g == 0 || g == 1) {
                                                    PopUp.deInitView();
                                                    if (e) {
                                                        e(g)
                                                    }
                                                } else {
                                                    PopUp.setFocus()
                                                }
                                            }
                                            break;
                                        case TVA.tvKey.KEY_RETURN:
                                            if (e) {
                                                e(0)
                                            }
                                            PopUp.deInitView();
                                            break
                                    }
                                } else {
                                    if (PopUp.type == "recording-chapter" || PopUp.type == "recording-serie") {
                                        switch (j) {
                                            case TVA.tvKey.KEY_LEFT:
                                                Commons.offHover(View.actualHover);
                                                k = "cancel-popup-message";
                                                if (View.actualHover == "option2-popup-message") {
                                                    k = "option1-popup-message"
                                                } else {
                                                    if (View.actualHover == "cancel-popup-message") {
                                                        if (PopUp.type == "recording-chapter") {
                                                            k = "option2-popup-message"
                                                        } else {
                                                            k = "option1-popup-message"
                                                        }
                                                    }
                                                }
                                                Commons.setHover(k);
                                                break;
                                            case TVA.tvKey.KEY_RIGHT:
                                                Commons.offHover(View.actualHover);
                                                k = "option2-popup-message";
                                                if (View.actualHover == "option2-popup-message") {
                                                    k = "cancel-popup-message"
                                                } else {
                                                    if (View.actualHover == "option1-popup-message") {
                                                        if (PopUp.type == "recording-chapter") {
                                                            k = "option2-popup-message"
                                                        } else {
                                                            k = "cancel-popup-message"
                                                        }
                                                    } else {
                                                        if (View.actualHover == "cancel-popup-message") {
                                                            k = "option1-popup-message"
                                                        }
                                                    }
                                                }
                                                Commons.setHover(k);
                                                break;
                                            case TVA.tvKey.KEY_ENTER:
                                                l = View.actualHover;
                                                PopUp.deInitView();
                                                if (e) {
                                                    if (l == "option1-popup-message") {
                                                        e(true)
                                                    } else {
                                                        if (l == "option2-popup-message") {
                                                            e(false)
                                                        }
                                                    }
                                                }
                                                break;
                                            case TVA.tvKey.KEY_RETURN:
                                                PopUp.deInitView();
                                                break
                                        }
                                    } else {
                                        if (PopUp.type == "voting") {
                                            var b, a;
                                            switch (j) {
                                                case TVA.tvKey.KEY_RIGHT:
                                                    if (View.actualHover === "voting-stars") {
                                                        b = $("#voting-stars-stars");
                                                        a = b.data("stars");
                                                        a++;
                                                        if (a <= 5) {
                                                            b.removeClass().addClass("stars stars" + a).data("stars", a)
                                                        }
                                                    } else {
                                                        Commons.offHover(View.actualHover);
                                                        Commons.setHover("cancel-popup-message")
                                                    }
                                                    break;
                                                case TVA.tvKey.KEY_LEFT:
                                                    if (View.actualHover === "voting-stars") {
                                                        b = $("#voting-stars-stars");
                                                        a = b.data("stars");
                                                        a--;
                                                        if (a > 0) {
                                                            b.removeClass().addClass("stars stars" + a).data("stars", a)
                                                        }
                                                    } else {
                                                        Commons.offHover(View.actualHover);
                                                        Commons.setHover("ok-popup-message")
                                                    }
                                                    break;
                                                case TVA.tvKey.KEY_UP:
                                                    if (View.actualHover !== "voting-stars") {
                                                        Commons.offHover(View.actualHover);
                                                        Commons.setHover("voting-stars")
                                                    }
                                                    break;
                                                case TVA.tvKey.KEY_DOWN:
                                                    if (View.actualHover === "voting-stars") {
                                                        Commons.offHover(View.actualHover);
                                                        Commons.setHover("ok-popup-message")
                                                    }
                                                    break;
                                                case TVA.tvKey.KEY_ENTER:
                                                    if (View.actualHover == "ok-popup-message") {
                                                        b = $("#voting-stars-stars");
                                                        var h = b.data("programId");
                                                        a = b.data("stars");
                                                        API.voteProgram(h, a)
                                                    } else {
                                                        if (View.actualHover == "cancel-popup-message") {
                                                            PopUp.deInitView()
                                                        }
                                                    }
                                                    break;
                                                case TVA.tvKey.KEY_RETURN:
                                                    PopUp.deInitView();
                                                    break
                                            }
                                        } else {
                                            if (j == TVA.tvKey.KEY_RETURN || (j == TVA.tvKey.KEY_ENTER && !PopUp.time)) {
                                                PopUp.callback = null;
                                                PopUp.deInitView();
                                                try {
                                                    if (e) {
                                                        e()
                                                    }
                                                    e = null
                                                } catch (c) {}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    goFrame: function(a) {
        if (a == "login-alta") {
            PopUp.loadExternal("login-registro.html", function() {
                $("#login-registro-email").removeClass("hide-this");
                TVA.putInnerHTML(document.getElementById("login-title"), "Si todavía no eres usuario");
                TVA.putInnerHTML(document.getElementById("login-name-label"), "email");
                TVA.putInnerHTML(document.getElementById("login-subtitle"), "Regístrate y Pruébalo Gratis");
                TVA.putInnerHTML(document.getElementById("login-registro-btnentrar"), "Registrar");
                document.getElementById("condiciones-checkox-check").checked = false;
                $("#condiciones-checkox").removeClass("condiciones-checkox-true");
                $(".condiciones").removeClass("hide-this");
                Keyboard.init();
                Commons.setHover("login-name");
                PopUp.type = "pairing-alta";
                $(".salirlogin").removeClass("salirlogin-login");
                PopUp.focusHover()
            })
        } else {
            if (a == "login-login") {
                PopUp.loadExternal("login-registro.html", function() {
                    $("#login-registro-email").addClass("hide-this");
                    TVA.putInnerHTML(document.getElementById("login-title"), "Si ya eres usuario...");
                    TVA.putInnerHTML(document.getElementById("login-name-label"), "Usuario o email");
                    TVA.putInnerHTML(document.getElementById("login-subtitle"), "Accede a tu cuenta");
                    TVA.putInnerHTML(document.getElementById("login-registro-btnentrar"), "Entrar");
                    $(".condiciones").addClass("hide-this");
                    Keyboard.init();
                    Commons.setHover("login-name");
                    PopUp.type = "pairing-login";
                    $(".salirlogin").addClass("salirlogin-login");
                    PopUp.focusHover()
                })
            }
        }
    },
    loadPairing: function(a) {
        PopUp.hideMessagesContainer();
        $("#messages-frame").removeClass("hide-this");
        TVA.putInnerHTML(document.getElementById("codigoactivacion"), "");
        if (a) {
            TVA.putInnerHTML(document.getElementById("messages-frame"), "")
        }
        PopUp.type = "pairing";
        PopUp.loadExternal("login.html", function() {
            if (PopUp.text != "") {
                $("#login-alta-url").html(PopUp.text.replace(/<br\/>/g, "&nbsp;"))
            }
            if (API.auth == true) {
                $("#ventana").addClass("ventana_login");
                $(".salir").addClass("ventana_login")
            }
            PopUp.updateCode();
            Commons.setHover("login-alta")
        })
    },
    loadExternal: function(a, b) {
        clearInterval(API.pairingTimeout);
        API.pairingTimeout = null;
        PopUp.blur();
        View.loaderShow($("#messages-frame").css("zIndex"));
        setTimeout(function() {
            $("#messages-frame").load(a, function() {
                $(".servicename").html(TVA.OTT.SERVICE);
                try {
                    TVA.putInnerHTML(document.getElementById("CONDICIONESTXT"), TVA.login.CONDICIONES);
                    TVA.putInnerHTML(document.getElementById("PPRIVTXT"), TVA.login.PPRIV);
                    TVA.putInnerHTML(document.getElementById("CHECKBOXTXT"), TVA.login.CHECKBOX)
                } catch (d) {}
                b();
                View.loaderHide();
                if (a == "login.html") {
                    clearInterval(API.pairingTimeout);
                    if (TVA.OTT.PAIRING !== false) {
                        API.pairingTimeout = setInterval(API.authDevice, 10000)
                    }
                    var c = "http://devices.totalchannel.tv/resources/smarttv/banners/login.jpg?nc=" + ((new Date()).getDate());
                    $("<img/>").load(function() {
                        $(".bloquebanner").css("background-image", "url(" + c + ")").removeClass("bloquebanner-border")
                    }).error(function() {
                        var f = $(".bloquebanner");
                        var e = f.height();
                        f.addClass("hide-this");
                        $(".bloquetexto").css({
                            height: Math.round(e / 4) + "px"
                        });
                        $(".wrapperlogin").find(".logo").css({
                            marginTop: Math.round(e / 2) + "px"
                        })
                    }).attr("src", c)
                }
            })
        }, 200)
    },
    pairingHandler: function(a, d) {
        if ($("#messages-container").is(":visible")) {
            switch (a) {
                case TVA.tvKey.KEY_ENTER:
                case TVA.tvKey.KEY_RETURN:
                    PopUp.hideMessagesContainer();
                    Commons.setHover(PopUp.previousHover);
                    break
            }
            return
        } else {
            if (Keyboard.isFocused) {
                if (Keyboard.keyDown(a) == false) {
                    return
                }
            }
        }
        if (typeof d == "undefined") {
            d = (PopUp.type == "pairing-alta")
        }
        var f = $("#login-mail");
        switch (a) {
            case TVA.tvKey.KEY_2:
                Keyboard.shift();
                break;
            case TVA.tvKey.KEY_1:
                var e = document.getElementById("login-pass").type;
                if (e == "text") {
                    e = "password";
                    $("#vercontrasena-li").html("Mostrar contraseña")
                } else {
                    e = "text";
                    $("#vercontrasena-li").html("Ocultar contraseña")
                }
                document.getElementById("login-pass").type = e;
                break;
            case TVA.tvKey.KEY_UP:
                switch (View.actualHover) {
                    case "login-name":
                        return;
                        break;
                    case "login-mail":
                        Commons.setHover("login-name");
                        PopUp.focusHover();
                        break;
                    case "login-pass":
                        if (f.is(":visible")) {
                            Commons.setHover("login-mail")
                        } else {
                            Commons.setHover("login-name")
                        }
                        PopUp.focusHover();
                        break;
                    case "condiciones-checkox":
                    case "condiciones-uso":
                        Commons.setHover("login-pass");
                        PopUp.focusHover();
                        break;
                    case "condiciones-politica":
                        Commons.setHover("condiciones-checkox");
                        break;
                    case "login-registro-btncancelar":
                    case "login-registro-btnentrar":
                        if (!d) {
                            Commons.setHover("login-pass");
                            PopUp.focusHover()
                        } else {
                            Commons.setHover("condiciones-politica");
                            PopUp.blur()
                        }
                        break;
                    case "politica-down":
                        Commons.setHover("politica-up");
                        break;
                    case "condiciones-down":
                        Commons.setHover("condiciones-up");
                        break;
                    case "politica-up":
                        Scroller.up("#politicadiv", ".condicionesusotexto");
                        break;
                    case "condiciones-up":
                        Scroller.up("#condicionesdiv", ".condicionesusotexto");
                        break
                }
                break;
            case TVA.tvKey.KEY_DOWN:
                switch (View.actualHover) {
                    case "login-name":
                        if (f.is(":visible")) {
                            Commons.setHover("login-mail")
                        } else {
                            Commons.setHover("login-pass")
                        }
                        PopUp.focusHover();
                        break;
                    case "login-mail":
                        Commons.setHover("login-pass");
                        PopUp.focusHover();
                        break;
                    case "login-pass":
                        if (!d) {
                            Commons.setHover("login-registro-btnentrar")
                        } else {
                            Commons.setHover("condiciones-checkox")
                        }
                        PopUp.blur();
                        break;
                    case "condiciones-checkox":
                    case "condiciones-uso":
                        Commons.setHover("condiciones-politica");
                        break;
                    case "condiciones-politica":
                        Commons.setHover("login-registro-btnentrar");
                        break;
                    case "login-registro-btncancelar":
                    case "login-registro-btnentrar":
                        return;
                        break;
                    case "politica-up":
                        Commons.setHover("politica-down");
                        break;
                    case "condiciones-up":
                        Commons.setHover("condiciones-down");
                        break;
                    case "politica-down":
                        Scroller.down("#politicadiv", ".condicionesusotexto");
                        break;
                    case "condiciones-down":
                        Scroller.down("#condicionesdiv", ".condicionesusotexto");
                        break
                }
                break;
            case TVA.tvKey.KEY_LEFT:
                switch (View.actualHover) {
                    case "login-registro-btnentrar":
                        Commons.setHover("login-registro-btncancelar");
                        break;
                    case "condiciones-uso":
                        Commons.setHover("condiciones-checkox");
                        PopUp.blur();
                        break;
                    case "condiciones-politica":
                        Commons.setHover("condiciones-uso");
                        break;
                    case "politica-up":
                    case "politica-down":
                        Commons.setHover("condiciones-politica");
                        break;
                    case "condiciones-up":
                    case "condiciones-down":
                        Commons.setHover("condiciones-uso");
                        break
                }
                break;
            case TVA.tvKey.KEY_RIGHT:
                switch (View.actualHover) {
                    case "login-name":
                    case "login-mail":
                    case "login-pass":
                        Keyboard.gainFocus(document.getElementById(View.actualHover), PopUp.onKeyboardLeft);
                        PopUp.blur();
                        break;
                    case "login-registro-btncancelar":
                        Commons.setHover("login-registro-btnentrar");
                        break;
                    case "condiciones-checkox":
                        Commons.setHover("condiciones-uso");
                        break;
                    case "condiciones-uso":
                        if ($("#condicionesdiv").is(":visible")) {
                            Commons.setHover("condiciones-down")
                        }
                        break;
                    case "condiciones-politica":
                        if ($("#politicadiv").is(":visible")) {
                            Commons.setHover("politica-down")
                        }
                        break
                }
                break;
            case TVA.tvKey.KEY_ENTER:
                switch (View.actualHover) {
                    case "login-name":
                    case "login-mail":
                    case "login-pass":
                        Keyboard.gainFocus(document.getElementById(View.actualHover), PopUp.onKeyboardLeft);
                        PopUp.blur();
                        break;
                    case "login-registro-btncancelar":
                        PopUp.loadPairing(false);
                        break;
                    case "login-registro-btnentrar":
                        if (PopUp.doLogin() == false) {
                            return
                        }
                        break;
                    case "condiciones-checkox":
                        if (TVA.device === "samsung" && TVA.year < 2012) {
                            document.getElementById("condiciones-checkox-check").checked = !document.getElementById("condiciones-checkox-check").checked;
                            if (document.getElementById("condiciones-checkox-check").checked) {
                                $("#condiciones-checkox").addClass("condiciones-checkox-true")
                            } else {
                                $("#condiciones-checkox").removeClass("condiciones-checkox-true")
                            }
                            Commons.setHover("condiciones-checkox");
                            PopUp.focusHover();
                            return
                        } else {
                            $("#condiciones-checkox-check").click()
                        }
                        break;
                    case "condiciones-uso":
                        PopUp.showDiv(true);
                        Commons.setHover("condiciones-down");
                        break;
                    case "condiciones-politica":
                        PopUp.showDiv(true);
                        Commons.setHover("politica-down");
                        break;
                    case "politica-up":
                        Scroller.up("#politicadiv", ".condicionesusotexto");
                        break;
                    case "condiciones-up":
                        Scroller.up("#condicionesdiv", ".condicionesusotexto");
                        break;
                    case "politica-down":
                        Scroller.down("#politicadiv", ".condicionesusotexto");
                        break;
                    case "condiciones-down":
                        Scroller.down("#condicionesdiv", ".condicionesusotexto");
                        break
                }
                break;
            case TVA.tvKey.KEY_RETURN:
                if (PopUp.type == "pairing-login" || PopUp.type == "pairing-alta") {
                    PopUp.loadPairing(false)
                } else {
                    if (API.auth == false) {
                        PopUp.deInitView()
                    } else {
                        TVA.handleReturn()
                    }
                }
                break
        }
        var b = navigator.userAgent.toLowerCase();
        if (b.indexOf("playstation") < 0 && b.indexOf("sony") < 0 && b.indexOf("linux i686") > 0 && b.indexOf("firefox") > 0 && TVA.keyDownEvt) {
            if ((a >= 65 && a <= 90) || (a >= 48 && a <= 57)) {
                var c = "";
                if (a >= 65 && a <= 90) {
                    c = String.fromCharCode(a + 97 - 65)
                } else {
                    c = String.fromCharCode(TVA.keyDownEvt.which)
                }
                if (Keyboard.upperCase > 0 || TVA.keyDownEvt.shiftKey == true) {
                    c = c.toUpperCase()
                }
                Keyboard.input.value += c;
                Keyboard.moveCursor(false);
                if (Keyboard.upperCase == 1) {
                    Keyboard.upperCase = 0;
                    Keyboard.setMask()
                }
            }
        }
        PopUp.showDiv()
    },
    onKeyboardLeft: function() {
        Keyboard.loseFocus();
        Commons.setHover(View.actualHover);
        PopUp.focusHover()
    },
    hidePass: function() {
        var a = document.getElementById("login-pass");
        if (a.type == "text") {
            $("#vercontrasena-li").html("Mostrar contraseña");
            a.type = "password"
        }
    },
    doLogin: function() {
        PopUp.hidePass();
        var a = (PopUp.type == "pairing-login");
        var b = PopMsg.getText(54);
        if (!document.getElementById("login-name").value && b && b.length) {
            PopUp.handleLoginError({
                message: b.replace("#FIELD#", $("#login-name-label").html())
            });
            return false
        }
        if (!a) {
            document.getElementById("login-mail").value = document.getElementById("login-name").value
        }
        if (!document.getElementById("login-pass").value && b && b.length) {
            PopUp.handleLoginError({
                message: b.replace("#FIELD#", $("#login-pass-label").html())
            });
            return false
        }
        if (!a && !document.getElementById("condiciones-checkox-check").checked) {
            b = PopMsg.getText(55);
            if (b && b.length) {
                PopUp.handleLoginError({
                    message: PopMsg.getText(55)
                });
                return false
            }
        }
        if (a) {
            API.doLogin(document.getElementById("login-name").value, document.getElementById("login-pass").value)
        } else {
            API.registerAndLogin(document.getElementById("login-name").value, document.getElementById("login-pass").value, document.getElementById("login-mail").value)
        }
        return true
    },
    handleLoginError: function(a) {
        PopUp.previousHover = View.actualHover;
        var b = DataStore.getFromObject(a, "message", "");
        if (!b) {
            b = PopMsg.getText(29)
        }
        TVA.putInnerHTML(document.getElementById("popup-message-text"), b);
        PopUp.showMessagesContainer();
        $("#popup-message-container").removeClass().addClass("message error-message");
        $("#ok-popup-message").removeClass("hide-this");
        $("#cancel-popup-message").addClass("hide-this");
        Commons.setHover("ok-popup-message")
    },
    showDiv: function(c) {
        var b = "";
        var a = "";
        switch (View.actualHover) {
            case "login-name":
            case "login-mail":
            case "login-pass":
            case "login-registro-btnentrar":
            case "login-registro-cancelar":
            case "condiciones-checkox":
                b = "#condicionesdiv,#politicadiv";
                a = "#keyboarddiv";
                break;
            case "condiciones-uso":
                if (!c) {
                    return
                }
            case "condiciones-up":
            case "condiciones-down":
                b = "#keyboarddiv,#politicadiv";
                a = "#condicionesdiv";
                break;
            case "condiciones-politica":
                if (!c) {
                    return
                }
            case "politica-up":
            case "politica-down":
                b = "#condicionesdiv,#keyboarddiv";
                a = "#politicadiv";
                break
        }
        if (a != "" && !$(a).is(":visible")) {
            clearTimeout(PopUp.showHideTimeout);
            PopUp.showHideTimeout = setTimeout("$('" + b + "').addClass('hide-this');$('" + a + "').removeClass('hide-this');", 200)
        }
    },
    setHover: function(a) {
        if (TVA.device === "samsung" && TVA.year < 2012 && $("#messages-container").is(":visible")) {
            return
        }
        Commons.setHover(a);
        PopUp.showDiv()
    },
    showMessagesContainer: function() {
        if (TVA.device === "samsung" && TVA.year < 2012) {
            $(":input").css("visibility", "hidden")
        }
        $("#messages-container").removeClass("hide-this")
    },
    hideMessagesContainer: function() {
        if (TVA.device === "samsung" && TVA.year < 2012) {
            $(":input").css("visibility", "visible")
        }
        $("#messages-container").addClass("hide-this")
    },
    hideIfVisible: function() {
        $("#popup-message-container").addClass("hide-this");
        $("#messages-frame").addClass("hide-this");
        PopUp.showMessagesContainer()
    },
    showIfVisible: function() {
        if (PopUp.isVisible) {
            if (PopUp.type == "pairing-login" || PopUp.type == "pairing-alta" || (PopUp.type == "pairing" && $(".header-menu-last").html() != "VINCULAR")) {
                PopUp.hideMessagesContainer();
                $("#messages-frame").removeClass("hide-this")
            } else {
                PopUp.showMessagesContainer();
                $("#popup-message-container").removeClass("hide-this")
            }
        } else {
            PopUp.hideMessagesContainer()
        }
    },
    blur: function() {
        try {
            if (PopUp.lastFocus) {
                if (TVA.device === "samsung" && TVA.year < 2012) {} else {
                    try {
                        var c = true;
                        if (View.actualHover == "condiciones-checkox" || View.actualHover == "login-registro-btnentrar") {} else {
                            if (TVA.device === "ps3") {
                                var b = PopUp.lastFocus;
                                if (b && (b.nodeName == "INPUT" || b.nodeName == "SELECT" || b.nodeName == "TEXTAREA")) {
                                    c = false
                                }
                            }
                        }
                        if (c == true) {
                            PopUp.lastFocus.blur()
                        }
                    } catch (f) {}
                }
                $(PopUp.lastFocus).removeClass("login-input-focus");
                PopUp.lastFocus = null
            } else {
                if (TVA.device === "ps3" && (View.actualHover == "condiciones-checkox" || View.actualHover == "login-registro-btnentrar")) {
                    $("#login-pass").blur()
                }
            }
        } catch (d) {}
    },
    focusHover: function() {
        PopUp.blur();
        try {
            PopUp.lastFocus = document.getElementById(View.actualHover);
            PopUp.lastFocus.focus();
            $(PopUp.lastFocus).addClass("login-input-focus")
        } catch (a) {}
    },
    setStep: function(d, a) {
        var c = $("#messages-step");
        var b = $("#messages-image");
        if (d > 0) {
            setTimeout(function() {
                var e = "<ul>";
                for (var f = 0; f < a; f++) {
                    if (f == d - 1) {
                        e += "<li class='step-on' onclick='PopUp.tutorialMove(0," + (f + 1) + ")' > </li>"
                    } else {
                        e += "<li class='step-off' onclick='PopUp.tutorialMove(0," + (f + 1) + ")' > </li>"
                    }
                }
                e += "</ul>";
                c.html("").removeClass("hide-this").html(e);
                var g = (b.width() - c.width()) / 2;
                c.css({
                    left: b.offset().left + g
                })
            }, 10)
        } else {
            c.html("").addClass("hide-this")
        }
    }
};
PopUp.showTutorial = function(a) {
    if (API.reloading === true && a !== true) {
        return false
    }
    if (a === true || totalChannelStorage.getItem("tutorial") !== "0FFF") {
        if (!PopUp.tutorial || !PopUp.tutorial.length) {
            return false
        }
        PopUp.showMe("tutorial", false, "");
        PopUp.callback = function(b) {
            if (b == 1) {
                totalChannelStorage.setItem("tutorial", "0FFF")
            }
            if (API.nextStepFunction != null) {
                API.nextStepFunction();
                API.nextStepFunction = null
            }
        };
        return true
    }
    return false
};
PopUp.checkTutorialScroll = function() {
    if (PopUp.tutorialCurrentPosition == 1) {
        $("#messages-image-left").addClass("hide-this");
        if (PopUp.tutorial.length > 1) {
            $("#messages-image-right").removeClass("hide-this")
        } else {
            $("#messages-image-right").addClass("hide-this")
        }
    } else {
        if (PopUp.tutorial.length <= PopUp.tutorialCurrentPosition) {
            $("#messages-image-left").addClass("hide-this");
            $("#messages-image-right").addClass("hide-this")
        } else {
            $("#messages-image-left").removeClass("hide-this");
            $("#messages-image-right").removeClass("hide-this")
        }
    }
};
PopUp.tutorialMove = function(a, d) {
    var c = $("#option1-popup-message");
    var b = $("#option2-popup-message");
    if (a != 0) {
        PopUp.tutorialCurrentPosition += a
    } else {
        PopUp.tutorialCurrentPosition = d
    }
    if (PopUp.tutorialCurrentPosition < 1) {
        PopUp.tutorialCurrentPosition = 1
    }
    if (PopUp.tutorialCurrentPosition > PopUp.tutorial.length) {
        PopUp.tutorialCurrentPosition = PopUp.tutorial.length
    }
    $("#messages-image").removeClass("hide-this").css("background-image", 'url("' + PopUp.tutorial[PopUp.tutorialCurrentPosition - 1] + '")');
    if (PopUp.tutorial.length <= PopUp.tutorialCurrentPosition) {
        PopUp.setStep(0, 0);
        Commons.offHover(View.actualHover);
        Commons.setHover("option1-popup-message");
        c.removeClass("hide-this").html("Cerrar");
        b.removeClass("hide-this").html("No mostrar de nuevo");
        $("#option3-popup-message").removeClass("hide-this").html("Reiniciar tutorial")
    } else {
        PopUp.setStep(PopUp.tutorialCurrentPosition, PopUp.tutorial.length);
        c.addClass("hide-this");
        b.addClass("hide-this");
        $("#option3-popup-message").addClass("hide-this")
    }
    PopUp.checkTutorialScroll()
};
var oldPlayerState = -1;
var VideoPlayer = {
    classname: "videoplayer",
    inited: false,
    details: {},
    buffering: false,
    bufferEmptyMessages: [],
    initialBufferingComplete: false,
    isHackNeededTimeout: null,
    videoStartTime: null,
    videoSeekTime: 0,
    currentSeconds: 0,
    currentSecondsOff: 0,
    currentTotalSeconds: 0,
    additionalSeconds: 0,
    playPbStart: 0,
    checkTimeout: null,
    lastPlayerResponseVideo: null,
    changingChannel: false,
    reloadingVideo: false,
    initView: function() {
        VideoPlayer.changingChannel = false;
        VideoPlayer.setFooter();
        VideoPlayer.inited = TVA_Player.init({
            height: 720,
            width: 1280
        });
        var a = $("#liveplayer-container");
        var c = $("#main-container");
        $("#top-panel").hide();
        VideoPlayer.showTrickModes();
        TVA_Player.setAudioInfo({
            track: [],
            selected: 0
        });
        TVA_Player.setSubtitlesInfo({
            track: [],
            selected: 0
        });
        if (VideoPlayer.details.isTrailer) {
            VideoPlayer.watchTrailer();
            VideoPlayer.setDetailsHTML()
        } else {
            if (VideoPlayer.details.isLive || TVA_Player.canSeek == false) {
                if (VideoPlayer.details.isLive && VideoPlayer.details.doNotReload !== true) {
                    API.getCurrentLiveContent(VideoPlayer.details.channelId)
                } else {
                    VideoPlayer.setDetailsHTML()
                }
            } else {
                VideoPlayer.setDetailsHTML()
            }
            if (VideoPlayer.details.assetId !== "") {
                try {
                    if (VideoPlayer.details.doNotReload === true && VideoPlayer.initPlayerResponseVideo) {
                        if (!VideoPlayer.initPlayer(VideoPlayer.initPlayerResponseVideo)) {
                            View.loaderHide()
                        } else {
                            VideoControls.hideControls();
                            Commons.setFocus("video-player");
                            Commons.setHover("video-player");
                            a.removeClass("hide-this");
                            c.addClass("hide-this");
                            VideoControls.updateTimer(0, 0);
                            View.loaderHide();
                            View.loaderShow()
                        }
                        return
                    }
                } catch (b) {}
                if (!API.getAsset(VideoPlayer.details.assetId)) {
                    View.loaderHide();
                    return
                }
            } else {
                OTTAnalytics.sendError(34, "VP01");
                PopMsg.show("error", 34, "VP01")
            }
        }
        Commons.setFocus("video-player");
        Commons.setHover("video-player");
        a.removeClass("hide-this");
        c.addClass("hide-this");
        VideoControls.updateTimer(0, 0);
        VideoControls.showControls(true, VideoPlayer.details.directMode);
        View.loaderHide();
        View.loaderShow()
    },
    showTrickModes: function() {
        var a = $("#video-container-controls").find(".trickmode");
        if (VideoPlayer.details.isTrailer) {
            a.show()
        } else {
            if (VideoPlayer.details.isLive || TVA_Player.canSeek == false) {
                a.hide()
            } else {
                a.show()
            }
        }
    },
    deInitView: function() {
        API.startPairingFn = null;
        API.videoPlayerLoaded = true;
        API.configLoaded = true;
        VideoPlayer.lastPlayerResponseVideo = VideoPlayer.initPlayerResponseVideo;
        window.clearTimeout(VideoPlayer.checkTimeout);
        if (!VideoPlayer.details || VideoPlayer.details.doNotReload !== true) {
            VideoPlayer.initPlayerResponseVideo = null
        }
        View.loaderHide();
        Subtitles.deinit();
        try {
            VideoControls.stop()
        } catch (a) {}
        try {
            VideoControls.reset()
        } catch (a) {}
        try {
            VideoControlsHack.disable()
        } catch (a) {}
        try {
            TVA_Player.setAudioInfo({
                track: [],
                selected: 0
            });
            TVA_Player.setSubtitlesInfo({
                track: [],
                selected: 0
            })
        } catch (a) {}
        window.clearTimeout(VideoPlayer.isHackNeededTimeout);
        VideoPlayer.currentSeconds = 0;
        VideoPlayer.currentSecondsOff = 0;
        VideoPlayer.playPbStart = 0;
        VideoPlayer.videoStartTime = null;
        VideoPlayer.setSeekTime(0);
        VideoPlayer.buffering = false;
        VideoPlayer.initialBufferingComplete = false;
        try {
            if (VideoPlayer.inited) {
                TVA_Player.deinit()
            }
        } catch (a) {}
        $("#liveplayer-container").removeClass("hide-this");
        Commons.offFocus(View.actualFocus);
        Commons.offHover(View.actualHover);
        if (VideoPlayer.changingChannel == false) {
            $("#main-container").removeClass("hide-this")
        }
        Header.hideMe(false);
        $("#footer").removeClass("hide-this");
        SidePanel.hideMe(true);
        SidePanel.reset()
    },
    setFocus: function() {
        VideoControls.setFocus()
    },
    getLive: function(b, a, h) {
        var g = false;
        if (Main.username === "" && typeof h !== "undefined") {
            g = false;
            a = 0
        } else {
            if (typeof a == "undefined" || a < 0) {
                a = 0;
                try {
                    var c = totalChannelStorage.getItem("API.channel.id");
                    if (c) {
                        for (var f = 0; f < b.length; f++) {
                            if (b[f]["id"] == c) {
                                a = f;
                                g = true;
                                break
                            }
                        }
                    }
                } catch (j) {}
            }
        }
        if (g == false && typeof h !== "undefined") {
            try {
                for (var d = 0; d < b.length; d++) {
                    if (b[d]["id"] == h) {
                        a = d;
                        break
                    }
                }
            } catch (j) {}
        }
        if (a < 0 || a >= b.length) {
            a = 0
        }
        return b[a]
    },
    setDetails: function(b, a) {
        VideoPlayer.detailsType = b;
        VideoPlayer.details = a
    },
    setFooter: function() {
        var d = [];
        if (VideoPlayer.details.isTrailer) {} else {
            var g = false;
            if (VideoPlayer.details.isLive) {
                g = true
            }
            var b = false;
            if (Main.username !== "") {
                b = true
            }
            d.push({
                text: "Ficha",
                className: "one-button-footer",
                keycode: TVA.tvKey.KEY_1,
                method: function() {
                    var e = DataStore.get(Type.Program, VideoPlayer.details.programId);
                    if (e.parent) {
                        var i = DataStore.get(Type.Program, e.parent);
                        if (i && i.isGroup === true) {
                            var j = "-";
                            if (VideoPlayer.details.assetId) {
                                j = VideoPlayer.details.assetId
                            }
                            var k = {
                                programId: VideoPlayer.details.programId,
                                eventId: VideoPlayer.details.eventId,
                                channelId: VideoPlayer.details.channelId,
                                parentId: (e ? e.parent : ""),
                                assetId: j,
                                program: i,
                                programNode: e,
                                finfo: {
                                    programId: (e ? e.id : ""),
                                    assetId: j,
                                    eventId: VideoPlayer.details.eventId
                                }
                            };
                            DataList.setDetails(k, k.finfo);
                            View.changeView(DataList);
                            return
                        }
                    }
                    DataSheet.setDetails(VideoPlayer.details.programId, VideoPlayer.details.eventId, VideoPlayer.details.channelId, VideoPlayer.details.assetId, VideoPlayer.details.isLive);
                    View.changeView(DataSheet, true)
                }
            });
            d.push({
                text: "Destacados",
                className: "two-button-footer",
                keycode: TVA.tvKey.KEY_2,
                method: function() {
                    VideoControls.hideControls();
                    VideoControls.showControls(true, true)
                }
            });
            d.push({
                text: "Grabar",
                className: "red-button-footer",
                disabled: !g,
                keycode: TVA.tvKey.KEY_RED,
                method: function() {
                    if (g) {
                        var e = VideoPlayer.details.eventId;
                        API.addMyTVItem("recording", e)
                    }
                    return false
                }
            });
            var c = "blue-button-footer";
            var a = TVA.tvKey.KEY_BLUE;
            if (TVA.device == "ps3") {
                c = "green-button-footer";
                a = TVA.tvKey.KEY_GREEN
            }
            d.push({
                text: "Votar",
                className: c,
                disabled: !b,
                keycode: a,
                method: function() {
                    if (b) {
                        var i = VideoPlayer.details.programId;
                        if (i) {
                            if (VideoControls.isHidden) {
                                VideoControls.showControls()
                            }
                            var e = DataStore.get(Type.Program, i);
                            PopUp.setVotingDetails(i, e.userVote);
                            PopUp.showMe("voting", false, "");
                            View.changeView(PopUp)
                        }
                    }
                    return false
                }
            });
            try {
                var f = TVA_Player.getAudioTracks();
                if (f && f.track && f.track.length > 1) {
                    c = "green-button-footer";
                    a = TVA.tvKey.KEY_GREEN;
                    if (TVA.device == "ps3") {
                        c = "blue-button-footer";
                        a = TVA.tvKey.KEY_BLUE
                    }
                    d.push({
                        text: "Audio",
                        className: c,
                        disabled: false,
                        keycode: a,
                        method: function() {
                            if (oldPlayerState == TVA_Player.state.playing) {
                                TVA_Player.setAudioTrack()
                            }
                            return false
                        }
                    })
                }
            } catch (h) {}
            try {
                if (Subtitles.loaded() == true) {
                    d.push({
                        text: "Subtitulos",
                        className: "yellow-button-footer",
                        disabled: false,
                        keycode: TVA.tvKey.KEY_YELLOW,
                        method: function() {
                            if (oldPlayerState == TVA_Player.state.playing) {
                                var e = Subtitles.showNext();
                                Alert.show("Subtitulos: " + ("" + e).toUpperCase(), true)
                            }
                            return false
                        }
                    })
                }
            } catch (h) {}
        }
        Footer.setLeft(d);
        Footer.enableLeft()
    },
    setDetailsHTML: function() {
        var f = "";
        var b = [];
        var k = "";
        var i = [];
        var e = "<span class='span-separator'></span>";
        if (VideoPlayer.details.programId || VideoPlayer.details.eventId) {
            var d = DataStore.get(Type.Program, VideoPlayer.details.programId);
            var a = DataStore.get(Type.Event, VideoPlayer.details.eventId);
            var h = DataStore.get(Type.Channel, a.channel);
            var g = "";
            if (a.startDate) {
                g = Utils.weekday[a.startDate.getDay()] + " " + a.startDate.getDate() + " de " + Utils.month[a.startDate.getMonth()] + "  " + Utils.checkTimeStr(a.startDate.getHours()) + ":" + Utils.checkTimeStr(a.startDate.getMinutes())
            }
            var c = "";
            if (d.season) {
                c = "T" + d.season;
                if (d.episodePartial) {
                    c += " Ep. " + d.episodePartial
                }
            }
            b = [];
            if (d.type) {
                b.push(d.type)
            }
            if (d.genre) {
                b.push(d.genre)
            }
            if (d.productionYear) {
                b.push(d.productionYear)
            }
            b = b.join(" ");
            k = DataSheet.buildIconHTML(d, a);
            i = [];
            if (h.name) {
                i.push("<span class='live-channel-name' >" + h.name + "</span>")
            }
            if (d.title) {
                i.push("<span class='live-title' >" + d.title + "</span>")
            }
            var j = [];
            if (d.episodeTitle) {
                j.push(d.episodeTitle)
            }
            if (c) {
                j.push(c)
            }
            if (b && b.length > 0) {
                j.push(b)
            }
            if (g && g.length > 0) {
                j.push(g)
            }
            if (k && k.length > 0) {
                j.push(k)
            }
            f += "<div class='info live-info'>";
            f += "<h1 class='series'>" + i.join(e) + "</h1>";
            f += "<h2 class='description'>" + j.join(e) + "</h2>";
            f += "</div>"
        }
        f += "<div class='top-panel-info' >Pulsa INFO para CERRAR</div>";
        TVA.putInnerHTML(document.getElementById("top-panel"), f);
        $("#top-panel").show()
    },
    watchTrailer: function() {
        var a = DataStore.get(Type.Program, VideoPlayer.details.programId);
        var b = a.trailerUrl;
        if (b) {
            TVA_Player.setURL(b);
            VideoControls.play();
            TVA_Player.show();
            VideoControls.setFocus()
        } else {
            OTTAnalytics.sendError(47, "VP02");
            PopMsg.show("error", 47, "VP02")
        }
    },
    initPlayer: function(b, e) {
        VideoPlayer.lastPlayerResponseVideo = {
            pbId: (b ? b.pbId : ""),
            assetId: (VideoPlayer.details ? VideoPlayer.details.assetId : "")
        };
        var d = "";
        try {
            if (e) {
                d = JSON.stringify(e)
            }
        } catch (a) {}
        Messenger.videoPlayerResponseReceived(d);
        if (b && b.url && b.pbId) {
            TVA_Player.canSeek = !Utils.isHLS(b.url);
            VideoPlayer.showTrickModes();
            var c = parseInt(b.played);
            if (VideoPlayer.reloadingVideo == true) {
                c = 0
            }
            if (VideoPlayer.details.isLive === true && VideoPlayer.details.channelId !== null) {
                totalChannelStorage.setItem("API.channel.id", VideoPlayer.details.channelId)
            }
            if (TVA.OTT.PLAYER_CAN_PLAY_FROM_POSITION && !isNaN(c) && c > 30 && !VideoPlayer.details.isLive) {
                View.loaderHide();
                PopUp.showMe("playfrom", false, "");
                View.changeView(PopUp);
                VideoPlayer.videoItem = b;
                PopUp.callback = VideoPlayer.initPlayerCallback
            } else {
                b.played = null;
                VideoPlayer.initPlayerResponse(b)
            }
            return true
        } else {
            OTTAnalytics.sendError(47, "VP03");
            View.previousPage(true);
            PopMsg.show("error", 47, "VP03");
            return false
        }
    },
    initPlayerCallback: function(b) {
        var a = VideoPlayer.videoItem;
        switch (b) {
            case "option2-popup-message":
                a.played = null;
            case "option1-popup-message":
                View.loaderShow();
                VideoPlayer.initPlayerResponse(a);
                break;
            default:
                View.previousPage();
                VideoPlayer.lastPlayerResponseVideo = a;
                Messenger.videoPlayerCanceled();
                VideoPlayer.lastPlayerResponseVideo = null;
                break
        }
    },
    initPlayerResponse: function(g) {
        VideoPlayer.initPlayerResponseVideo = g;
        VideoPlayer.lastPlayerResponseVideo = g;
        Messenger.videoPlayerConnecting();
        window.clearTimeout(VideoPlayer.checkTimeout);
        VideoPlayer.checkTimeout = window.setTimeout("VideoPlayer.checkPlayerStatus();", View.bufferingTimeoutTime);
        var c = $("#video-drm");
        try {
            OTTAnalytics.preStartPlay(g, VideoPlayer.details);
            c.html("");
            var h = parseInt(g.played);
            if (isNaN(h) || h < 0) {
                h = 0
            }
            if (typeof TVA_Widevine != "undefined" && g.drm && g.drm["type"] == "widevine") {
                TVA_Widevine.playWidevine({
                    url: g.url,
                    drmServerURL: g.drm["emmUrl"],
                    portalID: g.drm["portalId"],
                    streamID: g.pbId,
                    userData: g.pbId,
                    plastPlayedPosition: h
                })
            } else {
                if (g.drm && g.drm["type"] == "playready" && !window.platform) {
                    c.html(".");
                    g.drm["userData"] = g.pbId;
                    TVA_Player.play(g.drm, h)
                } else {
                    if (g.drm && g.drm["type"] == "playready" && window.platform) {
                        c.html(".");
                        var b = {
                            drm: g.drm["type"],
                            url: g.drm["url"],
                            licenseUrl: g.drm["emmUrl"],
                            userData: g.pbId
                        };
                        var f = h > 0 ? h : null;
                        if (window.platform.videoPlayer.play(b, f) === null) {
                            OTTAnalytics.sendError(47, "VP07");
                            View.previousPage(true);
                            PopMsg.show("error", 47, "VP07");
                            return
                        }
                    } else {
                        if (!g.drm || g.drm["type"] == "" || g.drm["type"] == "none") {
                            c.html("'");
                            if (!window.platform && typeof TVA_Widevine != "undefined" && TVA_Widevine.playVideo) {
                                TVA_Widevine.playVideo(g.url, h)
                            } else {
                                if (window.platform && window.platform.videoPlayer) {
                                    var a = {
                                        url: g.url
                                    };
                                    var d = h > 0 ? h : null;
                                    if (window.platform.videoPlayer.play(a, d) === null) {
                                        OTTAnalytics.sendError(47, "VP08");
                                        View.previousPage(true);
                                        PopMsg.show("error", 47, "VP08");
                                        return
                                    }
                                } else {
                                    OTTAnalytics.sendError(47, "VP04");
                                    View.previousPage(true);
                                    PopMsg.show("error", 47, "VP04");
                                    return
                                }
                            }
                        } else {
                            OTTAnalytics.sendError(47, "VP05");
                            View.previousPage(true);
                            PopMsg.show("error", 47, "VP05");
                            return
                        }
                    }
                }
            }
        } catch (i) {}
        OTTAnalytics.startPlay(g, VideoPlayer.details);
        EVT.reset();
        EVT.currentAssetId = VideoPlayer.details.assetId;
        EVT.currentPbId = g.pbId;
        VideoPlayer.buffering = false;
        VideoPlayer.currentSeconds = 0;
        VideoPlayer.currentSecondsOff = 0;
        VideoPlayer.videoStartTime = Utils.now();
        VideoPlayer.setSeekTime(VideoPlayer.videoStartTime);
        VideoControls.play();
        TVA_Player.show();
        VideoControls.setFocus()
    },
    setSeekTime: function(a) {
        if (typeof a == "undefined") {
            a = Utils.now()
        }
        VideoPlayer.videoSeekTime = a
    },
    checkPlayerStatus: function() {
        if (VideoPlayer.initialBufferingComplete == false) {
            OTTAnalytics.sendError(34, "VPLC02");
            View.previousPage(true);
            PopMsg.show("error", 34, "VPLC02")
        }
    },
    reloadVideo: function() {
        if (VideoPlayer.details.isLive) {
            return VideoPlayer.currentChannel()
        } else {
            var a = VideoPlayer.playPbStart;
            var c = EVT.pausedTime;
            VideoPlayer.details.doNotReload = true;
            VideoPlayer.reloadingVideo = true;
            VideoPlayer.changingChannel = true;
            try {
                View.changeView(VideoPlayer)
            } catch (b) {}
            VideoPlayer.reloadingVideo = false;
            VideoPlayer.playPbStart = a;
            EVT.pausedTime = c;
            if (TVA.device == "ps3" && TVA_Player.playPos >= 15) {
                if (window && window.platform && window.platform.ver >= 4) {
                    TVA_Player.pendingSeek = TVA_Player.playPos - 15
                } else {
                    TVA_Player.backward(15)
                }
            }
        }
        return true
    },
    currentChannel: function() {
        if (!VideoPlayer.details.isLive) {
            return false
        }
        if (DataStore.LiveChannels.length <= 0) {
            return false
        }
        var c;
        for (var a = 0; a < DataStore.LiveChannels.length; a++) {
            c = DataStore.LiveChannels[a];
            if (c.id === VideoPlayer.details.channelId) {
                var b = VideoPlayer.playPbStart;
                var d = EVT.pausedTime;
                VideoPlayer.setDetails("live", {
                    channelId: c.id,
                    programId: null,
                    eventId: null,
                    assetId: c.liveAsset,
                    isLive: true,
                    doNotReload: true
                });
                VideoPlayer.changingChannel = true;
                View.changeView(VideoPlayer);
                VideoPlayer.playPbStart = b;
                EVT.pausedTime = d;
                return true
            }
        }
        return false
    },
    channelNext: function() {
        if (!VideoPlayer.details.isLive) {
            return false
        }
        if (DataStore.LiveChannels.length <= 1) {
            return false
        }
        var c = false;
        var d;
        var e = null;
        var a = "" + VideoPlayer.details.channelId;
        for (var b = 0; b < DataStore.LiveChannels.length; b++) {
            d = DataStore.LiveChannels[b];
            if (c) {
                e = d;
                break
            } else {
                if ("" + d.id === a) {
                    c = true
                }
            }
        }
        if (!e) {
            e = DataStore.LiveChannels[0]
        }
        if (e) {
            VideoPlayer.setDetails("live", {
                channelId: e.id,
                programId: null,
                eventId: null,
                assetId: e.liveAsset,
                isLive: true
            });
            VideoPlayer.changingChannel = true;
            View.changeView(VideoPlayer);
            return true
        }
        return false
    },
    channelPrevious: function() {
        if (!VideoPlayer.details.isLive) {
            return false
        }
        if (DataStore.LiveChannels.length <= 1) {
            return false
        }
        var c = false;
        var d;
        var e = null;
        var a = "" + VideoPlayer.details.channelId;
        for (var b = DataStore.LiveChannels.length - 1; b >= 0; b--) {
            d = DataStore.LiveChannels[b];
            if (c) {
                e = d;
                break
            } else {
                if ("" + d.id === a) {
                    c = true
                }
            }
        }
        if (!e && DataStore.LiveChannels.length > 0) {
            e = DataStore.LiveChannels[DataStore.LiveChannels.length - 1]
        }
        if (e) {
            VideoPlayer.setDetails("live", {
                channelId: e.id,
                programId: null,
                eventId: null,
                assetId: e.liveAsset,
                isLive: true
            });
            VideoPlayer.changingChannel = true;
            View.changeView(VideoPlayer);
            return true
        }
        return false
    },
    hasStarted: function(c) {
        if (typeof c === "undefined") {
            c = true
        }
        var b = false;
        if (VideoPlayer.initialBufferingComplete == true) {
            var a = Utils.now();
            b = (a > VideoPlayer.videoStartTime + (3000));
            if (c) {
                b = b && (a > VideoPlayer.videoSeekTime + (6000))
            }
        }
        return b
    },
    bufferingStart: function() {
        VideoPlayer.buffering = true;
        View.bufferingStart();
        if (VideoPlayer.hasStarted(true) == true) {
            var c = new Date();
            var a = c.toISOString();
            var b = a.match(/(\d{4}\-\d{2}\-\d{2})T(\d{2}:\d{2}:\d{2})/);
            VideoPlayer.bufferEmptyMessages.push(b[1] + " " + b[2])
        }
    },
    bufferingComplete: function() {
        VideoPlayer.buffering = false;
        View.bufferingComplete();
        if (!VideoPlayer.initialBufferingComplete) {
            VideoPlayer.initialBufferingComplete = true;
            VideoPlayer.bufferEmptyMessages = [];
            EVT.start();
            VideoPlayer.videoStartTime = Utils.now();
            VideoPlayer.isHackNeededTimeout = window.setTimeout(VideoPlayer.checkIfHackNeeded, 3000);
            TVA_Player.checkAudioAndSubtitles();
            if (!VideoPlayer.details.isLive) {
                try {
                    var a = "";
                    if (VideoPlayer.initPlayerResponseVideo) {
                        a = VideoPlayer.initPlayerResponseVideo.url
                    }
                    if (a && a !== "") {
                        Subtitles.check(a, function() {
                            if (VideoPlayer.initialBufferingComplete == false || oldPlayerState != TVA_Player.state.playing) {
                                return -1
                            }
                            return TVA_Player.getRealTime() / 1000
                        }, function(c) {
                            $(".subtitles").html(c.replace(/\n/g, "<br/>"))
                        })
                    }
                } catch (b) {}
            }
            VideoControls.mouseover();
            VideoControls.checkControls()
        }
    },
    checkIfHackNeeded: function() {
        if (!VideoPlayer.details.isLive) {
            VideoControlsHack.disable();
            return
        }
        var a = Utils.now();
        if (VideoPlayer.videoStartTime < a - 4000) {
            if (VideoPlayer.currentSeconds === 0) {
                VideoControlsHack.enable()
            } else {
                VideoControlsHack.disable()
            }
        } else {
            VideoPlayer.isHackNeededTimeout = window.setTimeout(VideoPlayer.checkIfHackNeeded, 1000)
        }
    },
    keyHandler: function(a) {
        if (View.actualFocus === "side-panel-container-video") {
            SidePanel.keyHandler(a)
        } else {
            if (VideoControls.visibleControls() == false) {
                if (View.actualFocus == "filter-thumbnail-list-container") {
                    ThumbSliderFilter.keyHandler(a, true, true);
                    if (a != TVA.tvKey.KEY_STOP) {
                        return
                    }
                } else {
                    if (View.actualFocus == "thumbnail-list") {
                        if (a != TVA.tvKey.KEY_DOWN) {
                            ThumbSlider.keyHandler(a, true)
                        } else {
                            VideoControls.hideControls()
                        }
                        if (a != TVA.tvKey.KEY_STOP) {
                            return
                        }
                    }
                }
            }
            switch (a) {
                case TVA.tvKey.KEY_ENTER:
                    if (VideoControls.isHidden) {
                        API.getChannels("live");
                        return
                    }
                    break;
                case TVA.tvKey.KEY_PLAY:
                    VideoControls.play();
                    break;
                case TVA.tvKey.KEY_PAUSE:
                    VideoControls.pause();
                    break;
                case TVA.tvKey.KEY_RW:
                    VideoControls.rewind();
                    break;
                case TVA.tvKey.KEY_FF:
                    VideoControls.forward();
                    break;
                case TVA.tvKey.KEY_FAST_FW:
                    if (TVA.tvKey.KEY_FAST_FW > 0) {
                        VideoControls.fForward()
                    }
                    break;
                case TVA.tvKey.KEY_FAST_RW:
                    if (TVA.tvKey.KEY_FAST_RW > 0) {
                        VideoControls.fRewind()
                    }
                    break;
                case TVA.tvKey.KEY_STOP:
                    if (VideoControls.isHidden) {
                        VideoControls.showControls()
                    }
                    View.previousPage();
                    break;
                case TVA.tvKey.KEY_UP:
                    if (!VideoControls.isHidden) {
                        Header.setFocus();
                        return
                    }
                    break;
                case TVA.tvKey.KEY_CH_UP:
                    VideoPlayer.channelNext();
                    break;
                case TVA.tvKey.KEY_CH_DOWN:
                    VideoPlayer.channelPrevious();
                    break;
                case TVA.tvKey.KEY_INFO:
                case TVA.tvKey.KEY_DOWN:
                    VideoControls.lastButtonPress = 0;
                    if (VideoControls.isHidden) {
                        VideoControls.showControls()
                    } else {
                        VideoControls.hideControls()
                    }
                    return;
                    break;
                case TVA.tvKey.KEY_5:
                case TVA.tvKey.KEY_ZOOM:
                    if (TVA.device == "ps3") {
                        return
                    }
                    if (TVA_Player.zoom()) {
                        VideoControls.lastButtonPress = 0;
                        return
                    }
                    break;
                default:
                    break
            }
            VideoControls.keyHandler(a)
        }
    },
    checkChannelError: function() {
        if (VideoPlayer.details.isLive && VideoPlayer.details.channelId) {
            var a = totalChannelStorage.getItem("API.channel.id");
            if (a === VideoPlayer.details.channelId) {
                totalChannelStorage.setItem("API.channel.id", "")
            }
        }
    },
    seekTo: function(a) {
        if (!VideoPlayer.details.isLive && oldPlayerState == TVA_Player.state.playing) {
            try {
                if (TVA_Player.seekTo) {
                    VideoPlayer.setSeekTime();
                    TVA_Player.seekTo(a)
                }
            } catch (b) {}
        }
    }
};

function playHeadChanged(a) {
    if (OTTAnalytics.updatingPlayTime == true) {
        return
    }
    VideoPlayer.currentSeconds = a;
    OTTAnalytics.checkPosition(a);
    if (VideoPlayer.details.isLive) {
        VideoControls.updateTimer(VideoPlayer.additionalSeconds + a, VideoPlayer.currentTotalSeconds)
    } else {
        VideoControls.updateTimer(a, TVA_Player.getLength())
    }
}

function playStateChanged(b) {
    if (Debug.enabled) {
        var c = "";
        if (b == TVA_Player.state.stopped) {
            c = "STOPPED"
        } else {
            if (b == TVA_Player.state.playing) {
                c = "PLAYING"
            } else {
                if (b == TVA_Player.state.paused) {
                    c = "PAUSED"
                } else {
                    if (b == TVA_Player.state.buffering) {
                        c = "BUFFERING"
                    } else {
                        if (b == TVA_Player.state.finished) {
                            c = "FINISHED"
                        } else {
                            if (b == TVA_Player.state.connecting) {
                                c = "CONNECTING"
                            }
                        }
                    }
                }
            }
        }
    }
    if (VideoPlayer.details.isLive) {
        if (oldPlayerState == TVA_Player.state.stopped && b == TVA_Player.state.playing) {
            View.loaderShow()
        } else {
            if (oldPlayerState == TVA_Player.state.buffering && b == TVA_Player.state.playing) {
                View.loaderHide()
            }
        }
    }
    if (b == TVA_Player.state.finished) {
        var a = false;
        if (VideoPlayer.initialBufferingComplete == false && TVA.device == "lg") {
            a = true
        }
        if (a) {
            OTTAnalytics.sendError(34, "VPLC01")
        }
        View.previousPage(a);
        if (a) {
            PopMsg.show("error", 34, "VPLC01")
        }
    } else {
        if (b == TVA_Player.state.buffering) {
            VideoPlayer.bufferingStart()
        } else {
            if (b == TVA_Player.state.playing && VideoPlayer.buffering) {
                VideoPlayer.bufferingComplete()
            }
        }
    }
    if (b == TVA_Player.state.playing) {
        $("#player-controls0").addClass("pause");
        Subtitles.refresh()
    } else {
        if (b == TVA_Player.state.paused) {
            $("#player-controls0").removeClass("pause")
        }
        Subtitles.pause()
    }
    oldPlayerState = b
}

function playError(b, a) {
    if (b === true && View.actualPageIs(VideoPlayer)) {
        var c = "VPCN09";
        if (typeof a != "undefined") {
            c = c + ":" + a
        }
        OTTAnalytics.sendError(34, c);
        View.previousPage(true);
        PopMsg.show("error", 34, c)
    }
}

function bufferingProgress(a) {};
var View = {
    actualPage: null,
    actualFocus: "",
    actualHover: "",
    tempPage: null,
    history: [],
    loaderDepth: 0,
    loaderStepTime: 200,
    loaderElement: false,
    loaderAnim: false,
    loaderAnimIndex: 0,
    loaderTimeout: null,
    bufferingTimeout: null,
    bufferingTimeoutTime: 20000,
    lostFocus: null,
    lostHover: null,
    init: function() {
        View.actualPage = null;
        View.actualFocus = "";
        View.actualHover = "";
        View.lostFocus = null;
        View.lostHover = null;
        View.tempPage = null;
        View.history = [];
        View.loaderDepth = 0;
        View.loaderAnimIndex = 0;
        View.loaderTimeout = null;
        View.bufferingTimeout = null;
        try {
            $("#prev-big-slider").addClass("hide-this");
            $("#next-big-slider").addClass("hide-this");
            $("#sliders").addClass("hide-this");
            $("#content-multi-panel").addClass("hide-this");
            $("#multi-panel").addClass("hide-this");
            $("#epg").addClass("hide-this");
            $("#small-slider-vertical").addClass("hide-this");
            $("#liveplayer-container").addClass("hide-this");
            $("#main-container").removeClass("hide-this")
        } catch (a) {}
    },
    processConfig: function(d) {
        try {
            ThumbSliderFilter.jsonResponse(typeof d !== "undefined" && d !== null && typeof d.cscat !== "undefined" ? d.cscat : null);
            Header.jsonResponse(typeof d !== "undefined" && d !== null && typeof d.totalstore !== "undefined" ? d.totalstore : null);
            PopUp.tutorial = (typeof d !== "undefined" && d !== null && typeof d.tutorial !== "undefined" ? d.tutorial : null);
            var c = [];
            for (var b in PopUp.tutorial) {
                c[c.length] = PopUp.tutorial[b]
            }
            PopUp.tutorial = c
        } catch (f) {}
        var a = $(".header-menu-help");
        if (!PopUp.tutorial || !PopUp.tutorial.length) {
            a.addClass("hide-this")
        } else {
            a.removeClass("hide-this")
        }
        Home.alignDivs()
    },
    changeView: function(c, g) {
        if (c == null) {
            return
        }
        if (TVA.OTT.CLOSE_CHLIST == false && View.actualPage === c && SidePanel.isVisible() && !View.actualPageIs(VideoPlayer)) {
            SidePanel.closePanel();
            if (!View.actualPageIs(Storefront)) {
                return
            }
        }
        View.loaderShow();
        if (View.actualPage == null) {
            View.actualPage = c;
            View.lostFocus = null;
            View.lostHover = null
        } else {
            if (c === PopUp) {
                if (View.actualPage !== PopUp) {
                    View.lostFocus = View.actualFocus;
                    View.lostHover = View.actualHover;
                    View.tempPage = View.actualPage
                } else {}
            } else {
                APICache.cleanData();
                View.actualPage.deInitView(c);
                View.lostFocus = null;
                View.lostHover = null
            }
            try {} catch (b) {}
            if (API.auth == true && Main.username == "" && ((View.actualPage == VideoPlayer && c != VideoPlayer && c != PopUp) || (View.actualPage == Home && c == PopUp))) {
                var e = false;
                if (View.actualPage === VideoPlayer && c != VideoPlayer && c != PopUp) {
                    e = true;
                    c = Home
                } else {
                    if (PopUp.type.indexOf("pairing") < 0) {
                        e = true
                    }
                }
                if (e) {
                    API.startPairing(false)
                }
            }
            if (g === false) {} else {
                if (g === true || (View.actualPage !== c && View.actualPage !== VideoPlayer && View.actualPage !== PopUp && c !== PopUp)) {
                    View.history.push(View.actualPage)
                }
            }
            var f = [];
            for (var a = 0; a < View.history.length; a++) {
                var d = View.history[a];
                if (View.history.lastIndexOf(d) === a) {
                    f.push(d)
                }
            }
            View.history = f;
            View.actualPage = c
        }
        View.initActualPage(false, false, null)
    },
    initActualPage: function(b, a, c) {
        if (typeof b == "boolean" && b == true) {
            if (API.initialized && !Header.storeFrontLoaded) {
                API.getStorefrontOps()
            }
        }
        if (typeof b !== "boolean") {
            a = false
        }
        Header.checkActive();
        View.showClock();
        View.actualPage.fromHistory = a;
        View.actualPage.initView(c)
    },
    previousPage: function(c, b) {
        if (c === true) {
            if (View.actualPage === PopUp) {
                PopUp.deInitView()
            }
            Messenger.videoPlayerStoppedDisabled = true
        }
        if (TVA.device === "ps3" && View.history.length <= 0 && window.platform.ver > 0) {
            return
        }
        if (b !== true && View.history.length == 0) {
            return
        }
        View.loaderShow();
        APICache.cleanData();
        View.newPage = View.history.pop();
        var a = View.actualPage;
        View.actualPage.deInitView(View.newPage);
        View.actualPage = View.newPage;
        if (View.actualPage) {
            View.initActualPage(false, true, a);
            $("#header" + Header.activePage).removeClass("active");
            $("#header" + Header.actualPage).addClass("active");
            Header.activePage = Header.actualPage
        } else {
            Main.unload()
        }
    },
    loaderInit: function() {
        View.loaderElement = $("#loadermask");
        if (!View.loaderElement.attr("zidx")) {
            View.loaderElement.attr("zidx", View.loaderElement.css("zIndex"))
        }
        View.loaderAnim = $("#loaderAnim");
        View.loaderAnimIndex = 0;
        clearTimeout(View.loaderTimeout);
        View.loaderTimeout = null;
        clearTimeout(View.bufferingTimeout);
        View.bufferingTimeout = null
    },
    loaderShow: function(a) {
        View.loaderDepth++;
        if (View.loaderDepth == 1 || !View.loaderElement.is(":visible")) {
            View.loaderElement.show();
            View.loaderAnimStart()
        }
        clearTimeout(View.bufferingTimeout);
        View.bufferingTimeout = setTimeout(View.bufferingTimeoutComplete, API.timeout + 1000);
        if (a) {
            View.loaderElement.css("zIndex", a + 1)
        }
    },
    loaderHide: function() {
        View.loaderDepth--;
        if (View.loaderDepth <= 0) {
            View.loaderElement.hide();
            View.loaderAnimStop();
            View.loaderElement.css("zIndex", View.loaderElement.attr("zidx"));
            View.loaderDepth = 0;
            TVA.invalidate()
        }
    },
    bufferingStart: function() {
        if (View.loaderDepth == 0) {
            View.loaderElement.show();
            View.loaderAnimStart()
        }
        clearTimeout(View.bufferingTimeout);
        View.bufferingTimeout = setTimeout(View.bufferingTimeoutComplete, View.bufferingTimeoutTime)
    },
    bufferingTimeoutComplete: function() {
        View.loaderDepth--;
        View.bufferingComplete()
    },
    bufferingComplete: function() {
        clearTimeout(View.bufferingTimeout);
        View.loaderElement.hide();
        View.loaderAnimStop();
        View.loaderElement.css("zIndex", View.loaderElement.attr("zidx"));
        View.loaderDepth = 0;
        TVA.invalidate()
    },
    loaderAnimStart: function() {
        clearTimeout(View.loaderTimeout);
        View.loaderTimeout = window.setTimeout(View.loaderAnimStep, View.loaderStepTime)
    },
    loaderAnimStep: function() {
        View.loaderAnimIndex++;
        if (View.loaderAnimIndex > 11) {
            View.loaderAnimIndex = 0
        }
        View.loaderAnim.removeClass().addClass("load" + View.loaderAnimIndex);
        clearTimeout(View.loaderTimeout);
        View.loaderTimeout = window.setTimeout(View.loaderAnimStep, View.loaderStepTime)
    },
    loaderAnimStop: function() {
        clearTimeout(View.bufferingTimeout);
        View.bufferingTimeout = null;
        clearTimeout(View.loaderTimeout);
        View.loaderTimeout = null
    },
    actualPageIs: function(a) {
        return (View.actualPage === a || (View.tempPage === a && View.actualPage === PopUp))
    },
    showClock: function() {
        try {
            var a = totalChannelStorage.getItem("clock");
            if (a == "1" && View.actualPageIs(VideoPlayer)) {
                $("#directo").addClass("hide-this");
                $("#clock-footer").removeClass("hide-this");
                $("#video-buffering").removeClass("hide-this");
                View.updateClock()
            } else {
                $("#directo").removeClass("hide-this");
                $("#clock-footer").addClass("hide-this");
                $("#video-buffering").addClass("hide-this")
            }
        } catch (c) {}
    },
    updateClock: function() {
        try {
            var c = new Date();
            var b = "" + c.getHours();
            if (b.length == 1) {
                b = "0" + b
            }
            var f = "" + c.getMinutes();
            if (f.length == 1) {
                f = "0" + f
            }
            TVA.putInnerHTML(document.getElementById("clock-footer"), b + ":" + f);
            var a = "" + VideoPlayer.bufferEmptyMessages.length;
            if (a == "0") {
                a = ""
            }
            TVA.putInnerHTML(document.getElementById("video-buffering"), a)
        } catch (d) {}
    }
};
var Alert = {
    time: 2000,
    timeout: null,
    show: function(g, c, d) {
        if (typeof d === "undefined") {
            d = Alert.time;
            if (c !== true) {
                d = 3000
            }
        }
        var f = "alert-message";
        var h = "-txt";
        if (c === true) {
            f += "-centered";
            h += "-p"
        }
        TVA.putInnerHTML(document.getElementById(f + h), g);
        var b = $("#" + f);
        b.show();
        if (c === true) {
            var a = $("#" + f + "-txt");
            if (a.height() > 0 && a.find("p").length == 1 && a.find("p").height() > 0) {
                var e = Math.floor((a.height() - a.find("p").height()) / 2);
                if (e <= 0) {
                    e = "0"
                }
                a.css("padding-top", e + "px")
            } else {
                a.css("padding-top", "21px")
            }
        }
        clearTimeout(this.timeout);
        this.timeout = setTimeout("Alert.hide(" + c + ")", d)
    },
    hide: function(a) {
        var b = "alert-message";
        var c = "-txt";
        if (a === true) {
            b += "-centered";
            c += "-p"
        }
        TVA.putInnerHTML(document.getElementById(b + c), "");
        $("#" + b).hide()
    }
};
var Keyboard = {
    mask: 0,
    hover: null,
    input: "",
    upperCase: 0,
    isFocused: false,
    onLeft: null,
    textHelper: null,
    init: function() {
        Keyboard.mask = 0;
        Keyboard.hover = null;
        Keyboard.input = "";
        Keyboard.upperCase = 0;
        Keyboard.isFocused = false;
        Keyboard.onLeft = null;
        Keyboard.textHelper = null;
        $("#keyboarddiv .keyboard").mouseover(function() {
            Keyboard.setFocus(this)
        });
        this.setMask()
    },
    gainFocus: function(b, a) {
        this.isFocused = true;
        this.onLeft = a;
        $("#keyboarddiv").show();
        this.input = b;
        Keyboard.setFocus($("#1_0").get(0));
        return false
    },
    loseFocus: function(a) {
        this.isFocused = false;
        this.cleanFocus();
        this.input.focus();
        this.onLeft = null;
        if (a === true) {
            Main.keyDown(TVA.tvKey.KEY_DOWN)
        }
        return false
    },
    hide: function() {
        $("#keyboarddiv").hide();
        this.loseFocus();
        return false
    },
    shift: function() {
        Keyboard.upperCase++;
        if (Keyboard.upperCase > 2) {
            Keyboard.upperCase = 0
        }
        if (Keyboard.upperCase < 2) {
            Keyboard.setMask()
        } else {
            Keyboard.setShift()
        }
        return false
    },
    changeMask: function() {
        this.mask++;
        if (this.mask >= 3) {
            this.mask = 0
        }
        Keyboard.setMask();
        return false
    },
    del: function() {
        if (Keyboard.input) {
            Keyboard.input.value = Keyboard.input.value.substr(0, Keyboard.input.value.length - 1);
            Keyboard.moveCursor()
        }
        return false
    },
    moveCursor: function(b) {
        try {
            if (!Keyboard.input) {
                return
            }
            if (Keyboard.input.setSelectionRange) {
                var a = Keyboard.input.value.length;
                Keyboard.input.setSelectionRange(a, a)
            } else {
                Keyboard.input.value = Keyboard.input.value
            }
            Keyboard.input.scrollLeft = Keyboard.input.scrollWidth
        } catch (c) {}
    },
    decodeEntities: function(a) {
        if (Keyboard.textHelper == null) {
            Keyboard.textHelper = document.createElement("textarea")
        }
        TVA.putInnerHTML(Keyboard.textHelper, a);
        var b = Keyboard.textHelper.value;
        if (b.length == 0) {
            b = a
        }
        return b.substr(0, 1)
    },
    toHTML: function(a) {
        return a.replace(/[<>\&\"\']/g, function(b) {
            return "&#" + b.charCodeAt(0) + ";"
        })
    },
    onClick: function(a) {
        if (!Keyboard.input) {
            Keyboard.input = $("#" + View.actualHover);
            if (Keyboard.input.length) {
                Keyboard.input = Keyboard.input.get(0)
            } else {
                Keyboard.input = null
            }
        }
        if (Keyboard.input) {
            Keyboard.input.value += this.decodeEntities($(a).html());
            Keyboard.moveCursor(false);
            if (Keyboard.upperCase == 1) {
                Keyboard.upperCase = 0;
                Keyboard.setMask()
            }
        }
        return false
    },
    cleanFocus: function() {
        if (Keyboard.hover) {
            $(Keyboard.hover).removeClass("keyboard-hover");
            var b = $(Keyboard.hover).attr("class").split(" ");
            for (var a = 0; a < b.length; a++) {
                if (b[a].substr(0, 5) == "icon-") {
                    $(Keyboard.hover).removeClass(b[a] + "-hover")
                }
            }
        }
        return false
    },
    setFocus: function(c) {
        this.cleanFocus();
        Keyboard.hover = c;
        var b = $(Keyboard.hover).attr("class").split(" ");
        for (var a = 0; a < b.length; a++) {
            if (b[a].substr(0, 5) == "icon-") {
                $(Keyboard.hover).addClass(b[a] + "-hover")
            }
        }
        $(Keyboard.hover).addClass("keyboard-hover");
        return false
    },
    setMask: function() {
        $("#keyboarddiv .keyboard").each(function() {
            var d = $(this);
            var c = d.attr(Keyboard.upperCase > 0 ? "umask" : "mask");
            if (!c) {
                return
            }
            var e = Keyboard.mask;
            if (e >= c.length) {
                e = c.length - 1
            }
            var b = c.substr(e, 1);
            b = Keyboard.decodeEntities(b);
            d.html(Keyboard.toHTML(b))
        });
        var a = "";
        switch (this.mask) {
            case 0:
                a = "#12";
                break;
            case 1:
                a = "]ÀÈ";
                break;
            default:
                a = "ABC";
                break
        }
        if (Keyboard.upperCase > 0) {
            a = a.toUpperCase()
        } else {
            a = a.toLowerCase()
        }
        $("#keyboarddiv .changebtn").html(a);
        if (Keyboard.upperCase > 0) {
            $("#keyboard-shift-li").html("Minúsculas")
        } else {
            $("#keyboard-shift-li").html("Mayúsculas")
        }
        Keyboard.setShift();
        return false
    },
    setShift: function() {
        if (Keyboard.upperCase == 2) {
            $(".icon-shift").addClass("icon-shift-fixed")
        } else {
            $(".icon-shift").removeClass("icon-shift-fixed")
        }
    },
    keyDown: function(h) {
        var f = h;
        if (h.keyCode) {
            f = h.keyCode
        }
        var c = true;
        try {
            if (!$("#keyboarddiv").is(":visible")) {
                if (f == 13 || f == 29443) {
                    if (!h.target && !Keyboard.input) {
                        h.target = $("#txt1").get(0)
                    }
                    Keyboard.setFocus(h.target)
                }
                return false
            }
            if (!Keyboard.hover) {
                Keyboard.setFocus($("#0_0").get(0));
                return false
            }
            var d = $(Keyboard.hover);
            var i = d.attr("id").split("_");
            var b = false,
                a = false;
            switch (f) {
                case TVA.tvKey.KEY_UP:
                    b = true;
                    i[0]--;
                    c = false;
                    break;
                case TVA.tvKey.KEY_DOWN:
                    b = true;
                    i[0]++;
                    c = false;
                    break;
                case TVA.tvKey.KEY_LEFT:
                    if (i[1] == 0 && this.onLeft) {
                        this.onLeft();
                        return false
                    }
                    i[1]--;
                    var g = i[1];
                    if (!$("#" + i[0] + "_" + g).length) {
                        while (!$("#" + i[0] + "_" + g).length && g > 0) {
                            g--
                        }
                    }
                    if ($("#" + i[0] + "_" + g).length) {
                        i[1] = g
                    }
                    a = true;
                    c = false;
                    break;
                case TVA.tvKey.KEY_RIGHT:
                    i[1]++;
                    var g = i[1];
                    if (!$("#" + i[0] + "_" + g).length) {
                        while (!$("#" + i[0] + "_" + g).length && g < 20) {
                            g++
                        }
                    }
                    if ($("#" + i[0] + "_" + g).length) {
                        i[1] = g
                    }
                    a = true;
                    c = false;
                    break;
                case TVA.tvKey.KEY_ENTER:
                    if (d.attr("onclick")) {
                        d.click()
                    } else {
                        Keyboard.onClick("#" + d.attr("id"))
                    }
                    c = false;
                    break
            }
            if (b) {
                var g = i[1];
                while (!$("#" + i[0] + "_" + g).length && g > 0) {
                    g--
                }
                if (!$("#" + i[0] + "_" + g).length) {
                    while (!$("#" + i[0] + "_" + g).length && g < 20) {
                        g++
                    }
                }
                if ($("#" + i[0] + "_" + g).length) {
                    i[1] = g;
                    a = true
                }
            }
            if (a && $("#" + i[0] + "_" + i[1]).length) {
                Keyboard.setFocus($("#" + i[0] + "_" + i[1]).get(0))
            }
            try {
                h.preventDefault()
            } catch (h) {}
        } catch (h) {}
        return c
    }
};
if (!TVA.login) {
    TVA.login = {};
    TVA.login.CHECKBOX = "";
    TVA.login.CONDICIONES = '<h3>CONDICIONES DE USO DE OVER THE TOP INTERNET TELEVISION,S.L.</h3><br/> <br/> <font class="bold" >ACEPTACIÓN:</font><br/> <br/> Este sitio web es propiedad de OVER THE TOP INTERNET TELEVISION SL, con domicilio social en Av. Diagonal 177- Planta 12, Barcelona 08018, provista de CIF B-66250192 e inscrita en el Registro Mercantil de Barcelona, al Tomo 44.234, Folio 173, Sección 8, hoja número B 450480.<br/> <br/> Es importante que leas con atención todos los términos y Condiciones de Uso contenidos a continuación.<u>Mediante el mero acceso o uso a este sitio web, adquieres la condición de "Usuario" y consientes dichos términos y Condiciones de Uso. Si estás en desacuerdo, por favor no uses la web o Plataforma de OVER THE TOP INTERNET TELEVISION SL ni te registres en la misma</u>.<br/> <br/> Nos reservamos la posibilidad de modificar estas Condiciones de Uso en cualquier momento por razones legales, por motivos técnicos o por cambios en la prestación de los servicios de OVER THE TOP INTERNET TELEVISION SL, en adelante OTT Internet TV SL, o en la normativa, así como modificaciones que pudieran derivarse de códigos tipo aplicables o, en su caso, por decisiones corporativas. Cuando esto ocurra lo publicaremos en la Web y/o te avisaremos de ello a través de nuestra Plataforma, y si continúas utilizando los servicios de OTT Internet TV SL, entenderemos que has aceptado las modificaciones introducidas. Si no estuvieras de acuerdo con las modificaciones efectuadas, deberás dejar de utilizar la Plataforma.<br/> <br/> Te recomendamos no obstante que visites periódicamente las Condiciones de Uso para comprobar si existen actualizaciones. Puedes consultar siempre que lo desees la versión vigente en el apartado Condiciones de Uso que permanecerán disponibles en la Web.<br/> <br/> Estas Condiciones de Uso podrán ser completadas por OTT Internet TV SL a través de condiciones particulares que regulen el uso de determinados servicios o productos (ya sean gratuitos o ya sean de pago) que se puedan ofrecer a través de la Plataforma. En efecto, el acceso a ciertos contenidos y la utilización de algunos servicios o productos pueden encontrarse sometidos a determinadas condiciones particulares, que, según los casos, sustituirán, completarán y/o modificarán las presentes Condiciones de Uso de OTT Internet TV SL y, en caso de contradicción, prevalecerán los términos de las condiciones particulares sobre los estipulados en estas Condiciones de Uso.<br/> <br/> Estos términos y Condiciones de Uso serán de aplicación a los usuarios de la web o Plataforma de OTT Internet TV SL. No obstante, te advertimos de que la web o Plataforma de OTT Internet TV SL podría contener links o enlaces a websites de terceros. En este sentido, OTT Internet TV SL no asume ninguna responsabilidad por el contenido, políticas de privacidad o prácticas de estos terceros, tal y como se indicará a continuación. Adicionalmente, OTT Internet TV SL no podrá censurar o editar el contenido de cualquier sitio web de terceros. Mediante el uso de este sitio web, consientes en mantener indemne a OTT Internet TV SL de cualquier tipo de responsabilidad derivado del uso por tu parte del sitio web de cualquier tercero.<br/> <br/> <font class="bold" >ACCESO A LA WEB Y REGISTRO:</font><br/> <br/> El acceso a la Web es libre y gratuito. No obstante, para poder acceder a determinados servicios de OTT Internet TV SL será indispensable que te registres a través de nuestra Plataforma, mediante la cumplimentación de los oportunos formularios.<br/> <br/> Te informamos de que para registrarte en OTT Internet TV SL tienes que ser mayor de 14 años y sólo podrás contratar nuestros servicios como cliente si eres mayor de edad.<br/> <br/> El equipo de OTT Internet TV SL puede ponerse en contacto contigo, en cualquier momento, para que demuestres tu edad real aportándonos fotocopia de tu DNI o un documento equivalente. Si no se nos facilita esa información dentro del plazo que se te indique, desde OTT Internet TV SL nos reservamos el derecho a bloquear o cancelar tu cuenta.<br/> <br/> Los datos del DNI o del documento que se aporte serán utilizados única y exclusivamente por el personal autorizado de OTT Internet TV SL para realizar esta tarea de identificación, o, en su caso, para realizar tareas de facturación de los servicios o productos que contrates.<br/> <br/> Si somos informados de que un menor de edad está registrado como usuario y/o cliente en OTT Internet TV SL incumpliendo lo dispuesto en los párrafos anteriores, adoptaremos las medidas necesarias y podremos eliminar o bloquear la cuenta de ese usuario y/o cliente.<br/> <br/> Te pedimos que cualquier abuso o vulneración de las presentes Condiciones de Uso que detectes y, en particular, aquéllos que afecten a menores, nos lo reportes de inmediato.<br/> <br/> Como Usuario, aceptas que OTT Internet TV SL pueda utilizar y/o almacenar la información facilitada por tu parte o por tu banco (datos personales, datos de tu red, preferencias y si finalmente contratas el servicio, datos bancarios). También nos autorizas para que podamos recoger ciertos datos estáticos de tu configuración de red, que nos permitan identificarla. Todos estos datos, nos ayudarán para personalizar el servicio y para poder prestarte algunos servicios específicos, tanto de contenidos, como de publicidad, así como para configurarte el servicio de alertas (tanto de sistema, como de grabaciones) y comunicados de novedades y estrenos de contenidos.<u>Te sugerimos en este punto que leas con atención nuestra Política de Privacidad y protección de datos (ver aviso legal específico)</u>.<br/> <br/> En tu condición de usuario, te comprometes a hacer un uso diligente del código de usuario y de la clave de acceso facilitadas en el momento de efectuar el registro en nuestra Plataforma. En este sentido, te comprometes a mantenerlas en secreto y a comunicar a OTT Internet TV SL cualquier pérdida, revelación a terceros o robo de las mismas en el menor plazo de tiempo posible, con el fin de que OTT Internet TV SL pueda desactivarlas. Queda expresamente prohibido compartir las cuentas de usuario y nos reservamos el derecho de tomar cuantas medidas estén a nuestro alcance para evitarlo y restringir el servicio en caso de que se constate que esto ha ocurrido.<br/> <br/> <font class="bold" >DESCRIPCIÓN DEL SERVICIO:</font><br/> <br/> OTT Internet TV SL pone a disposición de cualquier usuario que se registre en su Plataforma y que disponga de una conexión de banda ancha a Internet, la opción de seleccionar y visualizar distintos canales de televisión y contenidos audiovisuales de terceros en el territorio español.<br/> <br/> Como usuario, tendrás opción de disfrutar del servicio en la modalidad "Prueba Gratis", si la opción comercial que selecciones recoge esta posibilidad, de acuerdo a las condiciones establecidas en cada momento y publicadas y detalladas en la web o site comercial asociados. Es necesario que te registres para poder disfrutar del servicio en esta modalidad y aceptar las Condiciones de Uso, así como nuestra Política de Privacidad. En esta modalidad, podrás disfrutar del servicio durante el período máximo establecido en la promoción comercial correspondiente, salvo que expresamente indiquemos lo contrario en la descripción del servicio publicada en la web.<br/> <br/> Como usuario puedes tener acceso a nuestra Plataforma y a los contenidos comercializados a través de la misma utilizando equipos o dispositivos autorizados de conexión, tales como Media Centers, Set-Top Boxes, y televisores, o bien a través de dispositivos SmartTV, inclusive plataformas móviles, televisores, consolas, tablets y PC, así como a través de plataformas que integran servicios Over The Top de las principales marcas disponibles en el mercado en cada momento. En la web o site comercial asociado se facilitará siempre un listado actualizado de los dispositivos sobre los cuales se puede disfrutar de cada paquete de servicio.<br/> <br/> Del mismo modo, se facilitará siempre vía web un listado y detalle actualizado de los paquetes y productos comerciales ofertados y disponibles sobre cada dispositivo.<br/> <br/> En cada uno de los paquetes comerciales y para cada uno de los canales que se incluyen en la oferta comercial concreta, te informamos de que se incluyen todas modalidades de acceso a los contenidos audiovisuales (salvo que se indique lo contrario en la descripción del paquete comercial correspondiente), así como distintos servicios editoriales de nuestra Plataforma, entre ellas y sin perjuicio de cualquier otra modalidad que se ofrezca en el futuro:<br/> <br/> <font class="bold" >1. <u>Televisión en directo</u></font>: te permite visualizar en directo  y a través de la conexión de banda ancha a internet, el mismo contenido que el/los canal/es retransmiten libremente o a través de las plataformas de TV de pago tradicionales. Accediendo a la información de cada paquete contratado, hallarás el número de canales disponibles (si se añaden otros), así como el detalle de los mismos.<br/> <br/> <font class="bold" >2. <u>Servicio Network PVR</u></font>: te permite programar grabaciones en  la Guía de Programación prevista para los siguientes días. Podrás siempre solicitar que se grabe un programa que se emita en cualquiera de los canales que se emiten en la plataforma y desde cualquier dispositivo. Las grabaciones no se podrán reproducir desde dispositivos portables si no te encuentras en tu hogar, salvo que explícitamente se indique en la descripción del paquete contratado. Por lo tanto, es imprescindible que nos definas cuál será tu punto de acceso habitual en el momento del registro de la cuenta de usuario para que designemos ese sitio como tu punto de acceso autorizado (MiRed). En algunos casos y bajo determinadas circunstancias puntuales, nos reservamos el derecho de ajustar o modificar las condiciones de uso de este servicio. El número de horas de grabación, así como el número de grabaciones simultáneas que te permitimos, estará especificado en todo momento en la descripción del paquete comercial disponible en nuestra web. Por otra parte, las grabaciones tendrán una duración limitada, por lo que deberás tenerlo en cuenta para disfrutar del servicio. El sistema te avisará de ciertos eventos relevantes, tales como avisos de caducidad, alertas de disponibilidad de los contenidos grabados, necesidad de borrado por limitaciones de espacio, etc. El sistema te ofrece un servicio de alertas básico activado en el momento de registro, pero podrás configurarlo a tu medida, accediendo a la zona de MiPerfil.<br/> <br/> <font class="bold" >3. <u>Servicio Catch Up TV</u></font>: te permite seleccionar y visualizar a través de la conexión de banda ancha a internet, contenidos en diferido de los emitidos en directo por los canales de TV y que la plataforma referencia como piezas independientes a través de los diferentes motores de recomendación de la plataforma. La duración y la accesibilidad de estos contenidos son limitadas y están en todo caso sujeta a los derechos de explotación que le han sido licenciados a OTT Internet TV SL por parte de los titulares de contenidos.<br/> <br/> <font class="bold" >4. <u>Servicio de Recomendaciones de Consumo de Contenidos  y Contenido Editorial Relacional</u></font>: el sistema configurará distintos grados y modalidades de recomendación de consumo de contenidos y pondrá a tu disposición la correspondiente selección, tanto en las interfaces de servicio en las distintas aplicaciones, como en envíos programados a tu cuenta de correo. Así mismo, incluimos también un servicio editorial que te permite estar informado de las novedades de los contenidos que se emiten en cada canal, así como de datos relevantes del sector, de las productoras, actores y personajes, así como de los canales de televisión y distribuidoras de dichos contenidos, que te será enviado a tu correo y también se mostrará en otros formatos y medidas en algunas interfaces de servicio en cada dispositivo (secciones de Destacados, Sliders promocionales, Secciones más Vistas más Valoradas TotalFan, etc.). El sistema te ofrece un servicio de básico activado en el momento de registro, pero podrás configurarlo a tu medida, accediendo a la zona de MiPerfil.<br/> <br/> <font class="bold" >5. <u>Servicio DTA</u></font> (Dynamic Targetted Advertising): la plataforma incluirá en algunos contenidos, cierta publicidad en distintos formatos, que pondrá a tu disposición en función de tu perfil de uso y consumo de contenidos. A medida que se recaben datos sobre tus preferencias, este servicio se irá personalizando y adaptando. Este servicio no es configurable por el usuario.<br/> <br/> OTT Internet TV SL se reserva el derecho de limitar el número máximo de horas de consumo de visualización de video a 20 horas en los paquetes TotalChannel Pack Premium, paquete TotalChannel DUO y a 40 horas en el paquete TotalChannel Pack Premium XL, a su pleno criterio con el fin de poder garantizar la calidad de servicio. En caso de que adopte esta medida, se le comunicará al usuario la tarifa o paquete comercial recomendado para satisfacer sus hábitos de consumo.<br/> <br/> El usuario podrá visualizar los contenidos desde cualquier dispositivo habilitado, pero en ningún caso se le permite más de una visualización simultánea. El número posible de dispositivos vinculables estará especificado en la descripción del servicio en la web.<br/> <br/> Cualquier cambio efectuado en la zona Mi Perfil del apartado "Notificaciones" se hará efectivo en un plazo de 72h.<br/> <br/> <font class="bold" ><u>CONDICIONES DE CONTRATACIÓN</u></font><br/> <br/> Como Usuario, tendrás siempre acceso y, en todo caso con carácter previo al proceso de contratación de nuestros servicios, a la Descripción del Servicio y Condiciones de Contratación. Asimismo, antes de completar el proceso de compra, podrás visualizar el precio final a pagar por el Servicio, con el correspondiente desglose.<br/> <br/> Durante el proceso de contratación se te indicarán los medios técnicos para identificar y corregir los errores en la introducción de tus datos.Todo el proceso de contratación se realizará en lengua española.<br/> <br/> Todo el proceso de contratación se realizará en lengua española.<br/> <br/> Una vez contratado el Servicio, en cualquiera de sus modalidades, podrás visualizar una página de confirmación.Una vez contratado el Servicio, en cualquiera de sus modalidades, podrás visualizar una página de confirmación.<br/> <br/> Dentro de las 24 horas siguientes a la contratación, OTT Internet TV SL te remitirá mediante email confirmatorio de los productos o servicios contratados a OTT Internet TV SL. Dicho email, así como estas condiciones es susceptible de archivarse e imprimirse. De igual forma, te informamos de que OTT Internet TV SL archivará los documentos electrónicos que formalicen el servicio contratado. Finalmente, te informamos de que podrás descargarte online la factura desde nuestra Web, sí así lo deseas.<br/> <br/> El precio de compra de los servicios deberá ser abonado, mediante tarjeta de crédito o débito, asociada a una cuenta bancaria de una persona con domicilio en España.<br/> <br/> Una vez contratado el servicio, el pago del mismo se realizará por mensualidades anticipadas. En el caso de que así nos lo indiques, mediante marcación en la casilla correspondiente, la renovación del servicio se realizará automáticamente cada mes y, en consecuencia, cada mes se efectuará el cargo correspondiente en la cuenta bancaria que nos facilites.<br/> <br/> OTT Internet TV SL no abonará el precio del mes en curso, una vez iniciada la prestación del servicio. No obstante, podrás cancelar y darte de baja en el servicio para el mes siguiente, siempre y cuando tú mismo acced con tus credenciales lo indiques en tu cuenta eliminando el tic de renovación automática con 24 horas de antelación a la fecha que te facturamos.<br/> <br/> Asimismo, te informamos de que OTT Internet TV SL se reserva la facultad de sustituir servicios obsoletos por versiones actualizadas del mismo, con la eventual actualización del precio, lo cual te será notificado oportunamente.<br/> <br/> OTT Internet TV SL no se responsabiliza en relación con la confidencialidad y seguridad de la información y datos que proporciones con ocasión del pago de tus compras y suscripciones electrónicas mediante tarjeta de crédito o débito, en la medida en que el tratamiento de dicha información y datos no se encuentre, en exclusiva, bajo el control de OTT Internet TV SL.<br/> <br/> Sin perjuicio de lo anterior, te informamos de que OTT Internet TV SL procura instalar todos los medios de seguridad a su alcance para evitar la pérdida, mal uso, alteración, acceso no autorizado y robo de los datos facilitados.<br/> <br/> <font class="bold" >PROPIEDAD INTELECTUAL E INDUSTRIAL:</font><br/> <br/> Todos los contenidos ofrecidos en la Plataforma, incluyendo la propia web, obras audiovisuales, textos, sinopsis, fotografías o ilustraciones, logos, marcas, grafismos, diseños, interfaces, etc., pertenecen a OTT Internet TV SL o han sido licenciados a OTT Internet TV SL por los terceros titulares de los derechos sobre dicho contenido y están protegidos por derechos de propiedad intelectual e industrial.<br/> <br/> Puedes utilizar la Plataforma y los contenidos publicados en ella de forma no exclusiva, sólo para tu uso privado (uso doméstico), y en cada caso según las condiciones de uso de cada contenido, dependiendo de si solo eres visitante de la página web, usuario registrado en período de "Prueba Gratis" o ya cliente que ha contratado nuestros servicios.<br/> <br/> No está permitido el uso comercial de los contenidos, ni copiar, almacenar o descargar, distribuir, publicar, enviar, transformar, utilizar cualquier técnica de ingeniería inversa, descompilar los contenidos o parte de los mismos, o realizar cualquier uso de medios o procedimientos distintos de los que se ponen a tu disposición en la Plataforma para utilizar los contenidos de forma distinta a la autorizada por OTT Internet TV SL.<br/> <br/> Tampoco puedes suprimir o manipular las indicaciones de copyright u otros créditos que identifiquen a los titulares de derechos de los contenidos que encuentres en la Plataforma ni los dispositivos técnicos de protección, las huellas digitales, marcas de agua, o cualquier otra medida tecnológica o mecanismo de protección o información incorporado a los contenidos ofrecidos en la Plataforma.<br/> <br/> Si imprimes, copias o descargas cualquier parte de nuestra web incumpliendo estos términos de uso, tu derecho a usar nuestra web cesará inmediatamente y estarás obligado, a nuestra elección, a devolver o destruir todas las copias de los materiales que hayas realizado. Lo anterior se entiende sin perjuicio de cualquier otra consecuencia legal.<br/> <br/> Las marcas, nombres comerciales o signos distintivos son titularidad de OTT Internet TV SL, sin que pueda entenderse que el acceso a nuestro portal o sitio web atribuya ningún derecho sobre las citadas marcas, nombres comerciales y/o signos distintivos.<br/> <br/>  Se hace constar que, al publicar contenidos (tales como "videos"o "comentarios") en los foros y secciones habilitadas para ello en nuestra Plataforma, estás concediendo a OTT Internet TV SL una licencia sobre los derechos de propiedad intelectual y/o industrial que en su caso pudieran corresponderte sobre tales contenidos. Dicha licencia no es exclusiva y abarca la totalidad de los derechos y modalidades de explotación de tales contenidos (incluyendo, de forma no limitativa, la reproducción, distribución, comunicación pública y transformación, por cualquier medio y en cualquier forma o soporte, tangible o intangible, con inclusión expresa de Internet), para todo el mundo y durante toda su vida legal, sin derecho a percibir por ello remuneración alguna.<br/> <br/> Excepción hecha de los datos de carácter personal que OTT Internet TV SL pueda recoger de acuerdo con lo establecido en nuestra Política de Privacidad, cualesquiera informaciones, ideas o materiales, de cualquier naturaleza, que sean remitidos a OTT Internet TV SL por el usuario, serán considerados públicos y no confidenciales y podrán ser utilizados libremente y sin cargo alguno por OTT Internet TV SL, así como por cualquiera de sus matrices o filiales, en los términos descritos en el párrafo anterior.<br/> <br/> Como usuario de nuestra Plataforma, al suministrar informaciones o contenidos en este sentido y con las consecuencias descritas en los dos párrafos anteriores, garantizas que no estás vulnerando ningún derecho de terceros, ni infringiendo ninguna disposición legal o reglamentaria, asumiendo de forma plena y exclusiva, cualquier responsabilidad que pudiera derivarse del suministro de tales informaciones o contenidos y de las consecuencias que se derivan de dicho suministro con arreglo a los dos párrafos anteriores.<br/> <br/> Por lo tanto, OTT Internet TV SL no se hace responsable respecto a posibles infracciones de derechos de propiedad intelectual y/o industrial de terceros ocasionados por los contenidos suministrados por terceros.Por lo tanto, OTT Internet TV SL no se hace responsable respecto a posibles infracciones de derechos de propiedad intelectual y/o industrial de terceros ocasionados por los contenidos suministrados por terceros.<br/> <br/> <font class="bold" >EXCLUSIÓN DE RESPONSABILIDAD:</font><br/> <br/> <font class="bold" >De los contenidos</font><br/> <br/> El acceso a nuestra Plataforma no implica la obligación por parte de OTT Internet TV SL de comprobar la veracidad, exactitud, adecuación, idoneidad, exhaustividad y actualidad de los contenidos titularidad terceros suministrada a través de nuestra plataforma.<br/> <br/> <font class="bold" >De la calidad del servicio</font><br/> <br/> Por supuesto, estamos realizando nuestros mayores esfuerzos para asegurar la continuidad, seguridad y calidad de nuestra Plataforma en base al estado actual de la técnica. Sin embargo, no podemos garantizar la disponibilidad permanente y la continuidad del funcionamiento de la Plataforma, ni la ausencia de virus u otros elementos dañinos que puedan producir alteraciones en tu sistema informático (corresponde al Usuario, en todo caso, la disponibilidad de herramientas adecuadas para la detección y desinfección de programas informáticos dañinos), ni tampoco la repercusión que la calidad de la conexión a internet de los usuarios pueda tener en el servicio, la fiabilidad, utilidad, veracidad, exactitud, exhaustividad y actualidad de la información contenida en la web. Por lo tanto, no nos hacemos responsables en caso de que cualquiera de estas circunstancias ocurra.<br/> <br/> <font class="bold" >De la disponibilidad del Servicio</font><br/> <br/> En relación con lo anterior, te informamos de que el acceso a la Plataforma requiere de servicios y suministros de terceros, incluidos el transporte a través de redes de telecomunicaciones cuya fiabilidad, calidad, continuidad y funcionamiento no corresponde a OTT Internet TV SL. Por consiguiente, los servicios proveídos a través de nuestra Plataforma pueden ser suspendidos, cancelados o resultar inaccesibles.<br/> <br/> De otra parte, te informamos de que determinados contenidos pueden ser objeto de bloqueo, a requerimiento de los titulares de los mismos, sin que OTT Internet TV SL pueda responsabilizarse de la eventual repercusión de la calidad o disponibilidad del Servicio.<br/> <br/> OTT Internet TV SL no se responsabiliza de los daños o perjuicios de cualquier tipo producidos en el Usuario que traigan causa de fallos o desconexiones en las redes de telecomunicaciones que produzcan la suspensión, cancelación o interrupción del servicio del Portal durante la prestación del mismo o con carácter previo.<br/> <br/> Finalmente, te informamos de que OTT Internet TV SL podrá eliminar, con carácter excepcional, algunos de los canales incluidos en el paquete que contrates, en el caso de perder los derechos de explotación sobre el mismo. En estos casos, OTT Internet TV SL hará todo lo posible por que el canal eliminado sea sustituido por otro de similares características, con el fin de que se vea afectado, lo mínimo posible, la calidad del Servicio contratado.<br/> <br/> <font class="bold" >Del contenido publicado por los usuarios</font><br/> <br/> No controlamos el contenido publicado por los usuarios en las zonas públicas de nuestra Plataforma y no asumimos responsabilidad alguna por estos contenidos. No obstante, OTT Internet TV SL se reserva la posibilidad de supervisar y/o moderar cualquier contenido publicado por los usuarios en la Plataforma y, en caso de que sean ofensivos, atentatorios contra los derechos humanos, inapropiados, difamatorios o susceptibles de vulnerar cualquier derecho de terceros, de editarlo o eliminarlo.<br/> <br/> En este sentido, si tienes conocimiento de la existencia de ese tipo información o contenido en OTT Internet TV SL que pueda ser indebido ponte en contacto con nosotros enviando un correo electrónico a <em>soporte@totalchannel.com</em><br/> <br/> <font class="bold" >POLÍTICA DE COOKIES:</font><br/> <br/> Te informamos de que OTT Internet TV SL podrá utilizar cookies durante la prestación del servicio del Portal. Mediante el acceso a este sitio web, das tu consentimiento para ello. Las cookies son procedimientos automáticos de recogida de información relativa a las preferencias determinadas por un usuario durante su visita a una determinada página web. Esta información se registra en pequeños archivos que son guardados en los equipos informáticos del usuario correspondiente de forma imperceptible. Cada vez que el usuario vuelve a acceder al sitio web en cuestión estos archivos se activan automáticamente de manera que se configura el sitio web con las preferencias señaladas en anteriores visitas.<br/> <br/> En definitiva, las cookies son ficheros físicos de información personal alojados en el propio terminal del usuario y asociados inequívocamente a este terminal. Gracias a las cookies OTT Internet TV SL te puede reconocer después de haber accedido por primera vez a nuestra plataforma y obtiene así información sobre la frecuencia de las visitas, los contenidos más vistos u otros datos, todo ello con el fin de optimizar y mejorar tu experiencia y la plataforma en general. Las cookies no pueden leer los archivos cookie creados por otros proveedores.<br/> <br/> El Usuario tiene la posibilidad de configurar su programa navegador de manera que se impida la creación de archivos cookie o se advierta del momento en que esto ocurre. Por lo tanto, OTT Internet TV SL te recomienda que revises las instrucciones o manuales de tu navegador y/o dispositivo de acceso para ampliar esta información ya que, según lo indicado, tienes la posibilidad de configurar tu navegador o el dispositivo de acceso para impedir su instalación. No obstante, determinados servicios de OTT Internet TV SL no podrán ser prestados de forma óptima sin tener instaladas las cookies.<br/> <br/> Concretamente estamos utilizando las Cookies para las finalidades que a continuación te exponemos, si en un futuro utilizamos otras con el propósito de ofrecerte más y mejores servicios, te informaremos de ello.<br/> <br/> Las Cookies propias de OTT Internet TV SL para acceder a nuestros servicios tienen como finalidad:<br/> <br/> 1. Recopilar información sobre tu navegación por OTT Internet TV SL. Nos sirven, por ejemplo, para recordarte una sesión iniciada con anterioridad, o incluso para identificarte en algunas ocasiones como un usuario anónimo.<br/> <br/> 2. Gestionar meta-datos (datos sobre los datos) y no tus datos personales.<br/> <br/> 3. Proporcionarnos información sobre los contenidos cuya visualización solicitas para facilitar dicha visualización y gestionar la configuración de tu perfil de usuario; también para adaptar y configurar el motor de recomendaciones y contenidos relacionados con tus preferencias y la publicidad segmentada asociada con tu perfil de usuario.<br/> <br/> 4. Otorgarnos información tecnológica para poder tramitar tus solicitudes como puedan ser licencias necesarias de otro software necesario para que funcione la Plataforma correctamente.<br/> <br/> <br/>Puedes obtener más información sobre nuestras Cookies accede aquí: www.totalchannel.com/politica-de-cookies<br/> <font class="bold" >LINKS:</font><br/> <br> <font class="bold" >De los contenidos y servicios enlazados a través del Portal:</font><br/> <br/> El servicio de acceso a esta web podrá incluir dispositivos técnicos de enlace, directorios e incluso instrumentos de búsqueda que te permiten como Usuario acceder a otras páginas y portales de Internet (en adelante, "Sitios Enlazados"). En estos casos, OTT Internet TV SL actúa como prestador de servicios de intermediación de conformidad con el artículo 17 de la Ley 34/2002, de 12 de julio, de Servicios de la Sociedad de la Información y el Comercio Electrónico (LSSI) y sólo será responsable de los contenidos y servicios suministrados en los Sitios Enlazados en la medida en que tenga conocimiento efectivo de la ilicitud y no haya desactivado el enlace con la diligencia debida.<br/> <br/> En el supuesto de que consideres que existe un Sitio Enlazado con contenidos ilícitos o inadecuados podrás comunicárselo a OTT Internet TV SL, sin que en ningún caso esta comunicación conlleve la obligación de retirar el correspondiente enlace.<br/> <br/> En ningún caso, la existencia de Sitios Enlazados debe presuponer la existencia de acuerdos con los responsables o titulares de los mismos, ni la recomendación, promoción o identificación de OTT Internet TV SL con las manifestaciones, contenidos o servicios provistas.<br/> <br/> OTT Internet TV SL no conoce los contenidos y servicios de los Sitios Enlazados y por tanto no se hace responsable por los daños producidos por la ilicitud, calidad, desactualización, indisponibilidad, error e inutilidad de los contenidos y/o servicios de los Sitios Enlazados ni por cualquier otro daño que no sea directamente imputable a OTT Internet TV SL.<br/> <br/> <font class="bold" >Introducción de enlaces al Portal:</font><br/> <br/> Si quieres introducir enlaces desde tus propias páginas web a nuestro portal, deberás cumplir con las condiciones que se detallan a continuación sin que el desconocimiento de las mismas evite las responsabilidades derivadas de la Ley:<br/> <br/> El enlace únicamente vinculará con la home page o página principal de nuestro portal de internet pero no podrá reproducirla de ninguna forma (deep links, inline links, hot links, copia de los textos, gráficos, etc.).<br/> <br/> Quedará en todo caso prohibido, de acuerdo con la legislación aplicable  y vigente en cada momento, establecer deep links así como frames o marcos de cualquier tipo que envuelvan a nuestro portal o permitan la visualización de los Contenidos a través de direcciones de Internet distintas a las de nuestro portal y, en cualquier caso, cuando se visualicen conjuntamente con contenidos ajenos a nuestro portal de forma que: (I) produzca, o pueda producir, error, confusión o engaño en los usuarios sobre la verdadera procedencia de los Contenidos; (II) suponga un acto de comparación o imitación desleal; (III) sirva para aprovechar la reputación de la marca y prestigio de OTT Internet TV SL; o (IV) de cualquier otra forma resulte prohibido por la legislación vigente.<br/> <br/> No se realizarán desde la página que introduce el enlace ningún tipo de manifestación falsa, inexacta o incorrecta sobre OTT Internet TV SL, sus empleados, proveedores, clientes o sobre la calidad de los servicios que comercializa.<br/> <br/> En ningún caso, se expresará en la página donde se ubique el enlace que OTT Internet TV SL ha prestado su consentimiento para la inserción del enlace o que de otra forma patrocina, colabora, verifica o supervisa los servicios del remitente.<br/> <br/> Está prohibida la utilización de cualquier marca denominativa, gráfica o mixta o cualquier otro signo distintivo de OTT Internet TV SL dentro de la página del remitente salvo en los casos permitidos por la ley o expresamente autorizados por OTT Internet TV SL y siempre que se permita, en estos casos, un enlace directo con nuestro portal en la forma establecida en esta cláusula.<br/> <br/> La página que establezca el enlace deberá cumplir fielmente con la ley y no podrá en ningún caso disponer o enlazar con contenidos propios o de terceros que: (I) sean ilícitos, nocivos o contrarios a la moral y a las buenas costumbres (pornográficos, violentos, racistas, etc.); (II) induzcan o puedan inducir en el usuario la falsa concepción de que OTT Internet TV SL suscribe, respalda, se adhiere o de cualquier manera apoya, las ideas, manifestaciones o expresiones, lícitas o ilícitas, del remitente; (III) resulten inapropiados o no pertinentes con la actividad de OTT Internet TV SL en atención al lugar, contenidos y temática de la página web del remitente.<br/> <br/> OTT Internet TV SL no tiene facultad ni medios humanos y técnicos para conocer, controlar ni aprobar toda la información, contenidos, productos o servicios facilitados por otros sitios web que tengan establecidos enlaces con destino a nuestra web. En este sentido, OTT Internet TV SL no asume ningún tipo de responsabilidad por cualquier aspecto relativo a la página web que establece ese enlace, en concreto, a título enunciativo y no limitativo, sobre su funcionamiento acceso, datos, información, archivos, calidad y fiabilidad de sus productos y servicios, sus propios enlaces y/o cualquiera de sus contenidos en general.<br/> <br/> <font class="bold" >POLÍTICA DE PRIVACIDAD:</font><br/> <br/> Para poder ser usuario registrado o cliente de los servicios de OTT Internet TV SL es necesario que, previamente, leas atentamente nuestra Política de Privacidad. En este sentido, te invitamos a que leas con atención nuestro aviso legal específico en materia de Política de Privacidad.<br/> <br/> <font class="bold" >GENERAL:</font><br/> <br/> Puedes contactar con nosotros enviando un correo electrónico a <em>soporte@totalchannel.com</em>.<br/> <br/> Si incumples estas Condiciones de Uso, OTT Internet TV SL podrá suspender o cancelar tu perfil automáticamente sin previo aviso, y, en ningún caso, tal suspensión o cancelación te daría derecho a reclamación y/o indemnización alguna. A estos efectos, te informamos que OTT Internet TV SL podrá poner en conocimiento y colaborar oportunamente con las autoridades policiales y judiciales competentes si detectase cualquier infracción de la legislación vigente o si tuviera sospecha de la comisión de algún delito.<br/> <br/> Los encabezamientos de las distintas cláusulas son sólo informativos, y no afectarán, calificarán o ampliarán la interpretación de las Condiciones de Uso.<br/> <br/> En el caso de existir discrepancia entre lo establecido en las presentes Condiciones de Uso y las condiciones particulares de cada servicio específico, prevalecerá lo dispuesto en éstas últimas.<br/> <br/> El no ejercicio o ejecución por parte de OTT Internet TV SL de cualquier derecho o disposición contenida en estas Condiciones de Uso no constituirá una renuncia al mismo, salvo reconocimiento y acuerdo por escrito por su parte.<br/> <br/> En el caso de que cualquier disposición o disposiciones de estas Condiciones de Uso fuera(n) considerada(s) nula(s) o inaplicable(s), en su totalidad o en parte, por cualquier Juzgado, Tribunal u órgano administrativo competente, dicha nulidad o inaplicación no afectará a las otras disposiciones de estas Condiciones de Uso.<br/> <br/> <font class="bold" >LEY APLICABLE Y JURISDICCIÓN</font><br/> <br/> Estas Condiciones de Uso se rigen por la ley española y serán competentes los Juzgados y Tribunales de Barcelona, para cuantas cuestiones puedan derivarse del uso de la Plataforma y de sus Condiciones de Uso.<br/> <br/>';
    TVA.login.PPRIV = '<h3>POLÍTICA DE PRIVACIDAD DE OVER THE TOP INTERNET TELEVISION SL</h3><br/> <br/> Esta Política de Privacidad (junto con las Condiciones de Uso y otros documentos referenciados en las mismas), establece las bases sobre las que, en caso de que recabemos o nos facilites datos personales durante tu experiencia en OVER THE TOP INTERNET TELEVISION SL, en adelante OTT Internet TV SL,&nbsp; ya sea a través de la dirección URL www.totalchannel.com (en adelante "la Web") o por otros medios digitales, soportes o dispositivos habilitados por OTT Internet TV SL (en su conjunto, "la Plataforma"), OTT Internet TV SL te garantiza el cumplimiento de la Ley Orgánica 15/1999, de 13 de diciembre, de Protección de Datos de Carácter Personal (en adelante, LOPD) y su normativa de desarrollo.<br/> <br/> Cuando sea necesario que nos facilites o accedamos a tus datos personales, ya sea para poner a disposición todas las facilidades de nuestra Plataforma al registrarte como usuario o como cliente de nuestros servicios, deberás leer esta Política de Privacidad y, en su caso, darnos tu consentimiento para que podamos tratar tus datos.<br/> <br/> <font class="bold" >Recogida de los datos</font><br/> <br/> A través de la Plataforma, OTT Internet TV SL puede recabar distintos tipos de datos personales, es decir, determinada información que por sus características nos permitirá identificarte, y se incorpora al fichero cuyo responsable es OTT Internet TV SL.<br/> <br/> Te informamos de que almacenamos los datos personales que nos facilitas cuando te registras en nuestra Plataforma para acceder a los servicios prestados por OTT Internet TV SL, en cualquiera de sus modalidades.<br/> <br/> Te agradecemos que los datos personales que nos remitas a través de la opción de registro sean veraces, completos, exactos y en todo caso, que estén actualizados.<br/> <br/> OTT Internet TV SL te comunica además, que la no cumplimentación de los datos personales requeridos en el apartado Regístrate podrá impedirnos gestionar adecuadamente el servicio de OTT Internet TV SL.<br/> <br/> Por último, te recordamos que para registrarte en OTT Internet TV SL tienes que ser mayor de 14 años, y sólo podrás contratar nuestros servicios como cliente si eres mayor de edad. Por eso, OTT Internet TV SL se reserva la facultad de solicitarte una fotocopia de tu D.N.I. u otro documento que acredite tu edad, en cuyo caso el equipo de OTT Internet TV SL te garantiza que los datos personales que nos facilites para acreditar tu edad, no serán utilizados para otra finalidad que no sea la de confirmar tu edad.<br/> <br/> <font class="bold" >Finalidad del tratamiento de los datos</font><br/> <br/> OTT Internet TV SL trata tus datos personales para identificarte como usuario, darte acceso a OTT Internet TV SL y poner a tu disposición todas las facilidades para la prestación de los servicios que ofrecemos. Para asegurar el buen uso de la Plataforma y nuestros servicios, OTT Internet TV SL podrá conservar ciertos datos mínimos de sus usuarios por un tiempo limitado tras la cancelación de su perfil.<br/> <br/> Antes de utilizar un nuevo servicio de OTT Internet TV SL, recuerda leer las Condiciones de Uso y si hay alguna condición específica de ese servicio, en ellas podrás ver si se tratan especialmente tus datos personales.<br/> <br/> Según lo indicado, los datos se recaban y serán tratados con la finalidad de facilitar el acceso a los contenidos ofrecidos a través de la plataforma; así como la de prestar, gestionar, informar y mejorar los servicios y/o contenidos ofrecidos; adecuar dichos servicios a las preferencias y gustos de los usuarios. Asimismo podrán ser tratados para realizar acciones publicitarias o promocionales y mantenerle informado sobre otros productos o servicios propios o de terceros, así como facilitarte información y noticias del sector y de los servicios que pueden ofrecerte, por correo electrónico o cualquier otro sistema de comunicación electrónica similar.<br/> <br/> Al aceptar la presente Política de Privacidad, das tu consentimiento y nos autorizas a llevar a cabo el tratamiento de tus datos personales con las finalidades descritas anteriormente.<br/> <br/> No obstante, si no quieres que te enviemos publicidad sobre otros productos o servicios que pudieran ser de tu interés o que podamos ceder tus datos a terceros que indirectamente colaboran con OTT Internet TV SL podrás indicarlo en el formulario de confirmación de la cuenta.<br/> <br/> <font class="bold" >Cesión de información</font><br/> <br/> A los efectos de lo previsto en los artículos 11 y 34.e) LOPD, consientes expresamente que tus datos puedan ser comunicados a cualquiera de las empresas del grupo al que pertenece OTT Internet TV SL, así como a terceros que colaboren directa o indirectamente en nuestra actividad, tratándose de una cesión a terceros, quienes podrán comunicarse contigo en relación con nuestros productos o servicios, con la finalidad que dicha intervención posibilite optimizar nuestra relación comercial contigo.<br/> <br/> Mediante la aceptación de lo dispuesto en el presente aviso legal y política de privacidad, consientes expresamente la utilización de tus datos, de conformidad con lo dispuesto en el artículo 27 LOPD, relativo a la comunicación de la primera cesión de datos.<br/> <br/> Asimismo, te informamos expresamente de que OTT Internet TV SL no acepta, ni recoge en sus ficheros, ni tampoco tratará de ningún modo, cualquier dato personal que no proceda directamente de su titular. En este sentido, te recordamos que solo puedes facilitarnos datos personales de tu propia titularidad y no de terceras personas, cuentes o no cuente con la autorización de éstas.<br/> <br/> <font class="bold" >Privacidad y seguridad en el tratamiento de los datos de carácter personal</font><br/> <br/> OTT Internet TV SL se compromete a tratar de forma absolutamente confidencial tus datos de carácter personal, haciendo uso de los mismos exclusivamente para las finalidades indicadas. OTT Internet TV SL te informa de que tiene implantadas las medidas de seguridad de índole técnica y organizativas necesarias que garanticen la seguridad de tus datos de carácter personal y eviten su alteración, pérdida, tratamiento y/o acceso no autorizado, habida cuenta del estado de la tecnología, la naturaleza de los datos almacenados y los riesgos a que están expuestos, ya provengan de la acción humana o del medio físico o natural. Todo ello de conformidad con lo previsto en el artículo 9 LOPD y en el Real Decreto 1720/2007, de 21 de diciembre, por el que se aprueba el Reglamento de desarrollo de la Ley 15/1999, de 13 de diciembre, de protección de datos de carácter personal.<br/> <br/> <font class="bold" >El ejercicio de tus derechos</font><br/> <br/> El consentimiento para la comunicación de datos de carácter personal es revocable en cualquier momento, si bien no tendrá efectos retroactivos, conforme a lo que dispone el artículo 6 y 11 LOPD.&nbsp;<br/> <br/> Podrás ejercer, si lo deseas, tu derecho de acceso, rectificación, cancelación y oposición al tratamiento de tus datos personales, en los términos y condiciones previstos en la propia LOPD, dirigiendo tu solicitud por correo a nuestra sede social en España "OTT Internet TV SL, S.L., Av. Diagonal 177 - Planta 12, Barcelona 08018", o bien contactando con nosotros en el correo electrónico: <em>soporte@totalchannel.com</em><br/> <br/> <font class="bold" >Información de otros sitios web</font><br/> <br/> Periódicamente, este sitio web de OTT Internet TV SL podrá ofrecer enlaces a otros sitios web. Te recomendamos revisar cuidadosamente las políticas de privacidad y protección de datos en los mismos ya que pueden diferir de la regulación de OTT Internet TV SL.<br/> <br/>'
};
OTTspYoubora = {
    init: function() {},
    play: function(c, a) {
        try {
            if (OTTAnalytics.enabled || TVA.OTT.OTTBALANCER) {
                OTTAnalytics.fillYouboraData(c, a);
                if (SmartPlugin && c) {
                    SmartPlugin.urlResource = c.url
                }
            } else {
                a(c);
                try {
                    setTimeout(function() {
                        Messenger.balancedUrl(c.url)
                    }, 100)
                } catch (b) {}
            }
        } catch (d) {}
    }
};
var OTTAnalytics = {
    firstTime: true,
    initialized: false,
    loadedLibs: false,
    nice264Plugin: null,
    username: "",
    pendingJoin: 0,
    enabled: true,
    updatingPlayTime: false,
    init: function() {
        try {
            if (typeof Nice264Analytics == "function") {
                Debug.fatal("OTTAnalytics.init: ERR: Nice264Analytics must not be defined !")
            }
            try {
                Debug.warning("Starting spYoubora");
                spYoubora.init();
                OTTspYoubora.init()
            } catch (a) {
                Debug.warning("INIT spYoubora ERR: " + a)
            }
        } catch (a) {}
    },
    authOk: function(b) {
        if (typeof b == "undefined") {
            b = Main.username
        }
        this.username = b;
        try {
            if (typeof Nice264Analytics == "function") {
                Debug.fatal("OTTAnalytics.authOk: ERR: Nice264Analytics must not be defined !");
                switch (TVA.device) {
                    case "lg":
                    case "samsung":
                    case "ps3":
                        this.initialized = true;
                        break
                }
            }
        } catch (a) {}
    },
    playerPositionLog: 0,
    playerPositionNotModified: 0,
    checkPosition: function(b) {
        if (b > 0) {
            if (OTTAnalytics.nice264Plugin && TVA.device !== "lg") {
                try {
                    OTTAnalytics.updatingPlayTime = true;
                    OTTAnalytics.nice264Plugin.onCurrentPlayTime(b)
                } catch (c) {}
            }
            OTTAnalytics.updatingPlayTime = false;
            var a = (oldPlayerState == TVA_Player.state.playing);
            if (b == OTTAnalytics.playerPositionLog && a == true) {
                OTTAnalytics.playerPositionNotModified++;
                if (OTTAnalytics.playerPositionNotModified == 30) {
                    VideoPlayer.bufferingStart();
                    OTTAnalytics.bufferingBegin()
                }
            } else {
                if (OTTAnalytics.playerPositionNotModified >= 30) {
                    VideoPlayer.bufferingComplete();
                    OTTAnalytics.bufferingEnd()
                }
                OTTAnalytics.playerPositionNotModified = 0
            }
            OTTAnalytics.playerPositionLog = b
        } else {
            OTTAnalytics.playerPositionLog = 0;
            OTTAnalytics.playerPositionNotModified = 0
        }
    },
    sendError: function(a, c) {
        if (View.actualPageIs(PopUp)) {
            PopUp.deInitView()
        }
        try {
            if (OTTAnalytics.nice264Plugin) {
                var d = null;
                switch (a) {
                    case 51:
                        d = Nice264AnalyticsError.CONNECTION_FAILED ? Nice264AnalyticsError.CONNECTION_FAILED : 1;
                        break;
                    case 47:
                        d = Nice264AnalyticsError.STREAM_NOT_FOUND ? Nice264AnalyticsError.STREAM_NOT_FOUND : 1;
                        break;
                    case 34:
                        switch (c) {
                            case "CONF01":
                                d = Nice264AnalyticsError.CONNECTION_FAILED ? Nice264AnalyticsError.CONNECTION_FAILED : 1000;
                                break;
                            case "VPLC02":
                                d = Nice264AnalyticsError.CONNECTION_FAILED ? Nice264AnalyticsError.CONNECTION_FAILED : 1000;
                                break;
                            case "VPCN09":
                                d = Nice264AnalyticsError.RENDER_ERROR ? Nice264AnalyticsError.RENDER_ERROR : 0;
                                break;
                            case "REND01":
                                d = Nice264AnalyticsError.RENDER_ERROR ? Nice264AnalyticsError.RENDER_ERROR : 0;
                                break;
                            case "STRM01":
                                d = Nice264AnalyticsError.STREAM_NOT_FOUND ? Nice264AnalyticsError.STREAM_NOT_FOUND : 1;
                                break;
                            case "VPLC01":
                                d = Nice264AnalyticsError.RENDER_ERROR ? Nice264AnalyticsError.RENDER_ERROR : 0;
                                break;
                            case "VEV01":
                                d = Nice264AnalyticsError.RENDER_ERROR ? Nice264AnalyticsError.RENDER_ERROR : 0;
                                break;
                            case "AUTH01":
                                d = Nice264AnalyticsError.AUTHENTICATION_FAILED ? Nice264AnalyticsError.AUTHENTICATION_FAILED : 1002;
                                break;
                            default:
                                d = Nice264AnalyticsError.CONNECTION_FAILED ? Nice264AnalyticsError.CONNECTION_FAILED : 1000;
                                break
                        }
                        break
                }
                if (d !== null) {
                    OTTAnalytics.nice264Plugin.error(d, " [nr:" + a + ":" + c + "]");
                    OTTAnalytics.nice264Plugin.stop();
                    OTTAnalytics.nice264Plugin = null
                }
            }
        } catch (b) {}
    },
    bufferingBegin: function() {
        if (OTTAnalytics.nice264Plugin) {
            OTTAnalytics.nice264Plugin.buffer(Nice264AnalyticsEvents.BUFFER_BEGIN)
        }
    },
    bufferingEnd: function() {
        if (OTTAnalytics.nice264Plugin) {
            OTTAnalytics.nice264Plugin.buffer(Nice264AnalyticsEvents.BUFFER_END)
        }
    },
    deinit: function() {
        if (OTTAnalytics.nice264Plugin) {
            OTTAnalytics.nice264Plugin.stop();
            OTTAnalytics.nice264Plugin = null
        }
    },
    getCommunicationClass: function(a) {
        if (!SmartPlugin) {
            return null
        }
        if (!SmartPlugin.getOttCommunicationClass) {
            SmartPlugin._getOttCommunicationClass = null;
            SmartPlugin.getOttCommunicationClass = function() {
                if (SmartPlugin._getOttCommunicationClass == null) {
                    var c = null;
                    try {
                        for (c in SmartPlugin) {
                            if (SmartPlugin.hasOwnProperty(c)) {
                                if (SmartPlugin[c] instanceof YouboraCommunication) {
                                    SmartPlugin._getOttCommunicationClass = SmartPlugin[c];
                                    break
                                }
                            }
                        }
                    } catch (d) {}
                    if (SmartPlugin._getOttCommunicationClass == null) {
                        for (c in SmartPlugin) {
                            if (SmartPlugin.hasOwnProperty(c)) {
                                try {
                                    if (typeof SmartPlugin[c] == "object" && (SmartPlugin[c].getPingTime && SmartPlugin[c].sendAnalytics)) {
                                        SmartPlugin._getOttCommunicationClass = SmartPlugin[c];
                                        break
                                    }
                                } catch (b) {}
                            }
                        }
                    }
                }
                if (SmartPlugin._getOttCommunicationClass == null && SmartPlugin.communicationClass) {
                    SmartPlugin._getOttCommunicationClass = SmartPlugin.communicationClass
                }
                if (SmartPlugin._getOttCommunicationClass == null && SmartPlugin.communications) {
                    SmartPlugin._getOttCommunicationClass = SmartPlugin.communications
                }
                return SmartPlugin._getOttCommunicationClass
            }
        }
        if (a == true) {
            SmartPlugin._getOttCommunicationClass = null
        }
        return SmartPlugin.getOttCommunicationClass()
    },
    preStartPlay: function(h, d) {
        if (typeof youboraData !== "undefined" && youboraData.setAccountCode) {
            youboraData.setAccountCode(TVA.OTT.ACODE)
        }
        if (OTTAnalytics.enabled == false) {
            try {
                if (typeof youboraData !== "undefined") {
                    youboraData.setEnableAnalytics(false)
                }
                if (SmartPlugin) {
                    var c = OTTAnalytics.getCommunicationClass(true);
                    c.enableAnalytics = false;
                    for (var a in c) {
                        if (c.hasOwnProperty(a)) {
                            try {
                                if (typeof c[a] !== "string" && typeof c[a] !== "boolean" && typeof c[a] !== "number") {
                                    if (typeof c[a] === "function") {
                                        if (a.indexOf("send") == 0 || a.indexOf("check") == 0 || a.indexOf("load") == 0 || a.indexOf("validate") == 0 || a == "init" || a == "cPing" || a == "addEventToQueue") {
                                            if (c[a] !== API.voidFn) {
                                                c[a] = API.voidFn
                                            }
                                        } else {
                                            if (a == "getPingTime") {
                                                if (c[a] !== API.voidFn) {
                                                    c[a] = function() {
                                                        return 60 * 1000
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            } catch (g) {}
                        }
                    }
                }
            } catch (b) {}
            try {
                c = YouboraCommunication.prototype;
                for (var a in c) {
                    if (c.hasOwnProperty(a)) {
                        try {
                            if (typeof c[a] !== "string" && typeof c[a] !== "boolean" && typeof c[a] !== "number") {
                                if (typeof c[a] === "function") {
                                    if (a.indexOf("send") == 0 || a.indexOf("check") == 0 || a.indexOf("load") == 0 || a.indexOf("validate") == 0 || a == "init" || a == "cPing" || a == "addEventToQueue") {
                                        if (c[a] !== API.voidFn) {
                                            Debbug.log("CLEAN ::::: " + a);
                                            c[a] = API.voidFn
                                        }
                                    } else {
                                        if (a == "getPingTime") {
                                            if (c[a] !== API.voidFn) {
                                                c[a] = function() {
                                                    return 60 * 1000
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } catch (g) {}
                    }
                }
            } catch (f) {}
        }
        if (OTTAnalytics.enabled == false) {} else {
            if (TVA.device === "ps3") {
                this.initPlay(h, d)
            }
        }
    },
    startPlay: function(b, a) {
        if (TVA.device !== "ps3") {
            this.initPlay(b, a)
        }
    },
    initPlay: function(g, b) {
        if (OTTAnalytics.enabled == false) {
            return
        }
        if (this.loadedLibs == false) {
            return
        }
        if (this.initialized == false) {
            return
        }
        try {
            var j = {
                username: this.username,
                interval: 0
            };
            var a = OTTAnalytics.firstTime;
            OTTAnalytics.firstTime = false;
            if (OTTAnalytics.nice264Plugin) {
                OTTAnalytics.nice264Plugin.reset();
                OTTAnalytics.nice264Plugin = null
            }
            var c = false;
            switch (TVA.device) {
                case "lg":
                    OTTAnalytics.nice264Plugin = new Nice264Analytics("LGplayer", "totalch", "http://nqs.nice264.com/", j);
                    OTTAnalytics.nice264Plugin._errorSent = false;
                    OTTAnalytics.nice264Plugin._stopped = false;
                    OTTAnalytics.nice264Plugin.setPlayerStateCallback("TVA_Player.onPlayStateChange");
                    c = true;
                    if (a) {
                        Nice264Analytics.prototype._error = Nice264Analytics.prototype.error;
                        Nice264Analytics.prototype.error = function(w, v) {
                            try {
                                if (this._errorSent == true) {
                                    return
                                }
                                this._errorSent = true;
                                var u = "";
                                if (typeof v === "string" && v.length > 0) {
                                    u = encodeURIComponent(v);
                                    this.player.error = w;
                                    var x = Nice264AnalyticsError[w].message;
                                    Nice264AnalyticsError[w].message = x + u;
                                    this._error();
                                    Nice264AnalyticsError[w].message = x
                                } else {
                                    this._error()
                                }
                            } catch (t) {}
                        };
                        Nice264Analytics.prototype._stop = Nice264Analytics.prototype.stop;
                        Nice264Analytics.prototype.stop = function() {
                            if (this._stopped == true) {
                                return
                            }
                            this._stopped = true;
                            var e = this;
                            setTimeout(function() {
                                e._stop()
                            }, 200)
                        }
                    }
                    break;
                case "samsung":
                    OTTAnalytics.nice264Plugin = new Nice264Analytics("pluginPlayer", "totalch", "http://nqs.nice264.com/", j);
                    OTTAnalytics.nice264Plugin.setPlayerProgressCallback("TVA_Player.setCurrentTime");
                    if (TVA.year < 2012) {
                        TVA_Player.player.OnCurrentPlayTime = "OTTAnalytics.setCurrentTime"
                    }
                    c = true;
                    if (a) {
                        Nice264Analytics.prototype._error = Nice264Analytics.prototype.error;
                        Nice264Analytics.prototype.error = function(v, u) {
                            var t = "";
                            if (typeof u === "string") {
                                t = encodeURIComponent(u)
                            }
                            this._error({
                                id: v.id,
                                message: v.message + t
                            })
                        };
                        TVA_Player._stop = TVA_Player.stop;
                        TVA_Player.stop = function() {
                            TVA_Player._stop();
                            if (OTTAnalytics.nice264Plugin) {
                                OTTAnalytics.nice264Plugin.stop();
                                OTTAnalytics.nice264Plugin = null
                            }
                        };
                        TVA_Player._pause = TVA_Player.pause;
                        TVA_Player.pause = function(s) {
                            TVA_Player._pause(s);
                            if (s) {
                                if (OTTAnalytics.nice264Plugin) {
                                    OTTAnalytics.nice264Plugin.pause()
                                }
                            } else {
                                if (OTTAnalytics.nice264Plugin) {
                                    OTTAnalytics.nice264Plugin.resume()
                                }
                            }
                        };
                        TVA_Player._bufferingStart = TVA_Player.bufferingStart;
                        TVA_Player.bufferingStart = function() {
                            if (VideoPlayer.hasStarted(true) == true || OTTAnalytics.pendingJoin == 1) {
                                OTTAnalytics.bufferingBegin()
                            }
                            TVA_Player._bufferingStart()
                        };
                        TVA_Player._bufferingComplete = TVA_Player.bufferingComplete;
                        TVA_Player.bufferingComplete = function() {
                            if (VideoPlayer.hasStarted(true) == true || OTTAnalytics.pendingJoin == 1) {
                                OTTAnalytics.pendingJoin = 0;
                                OTTAnalytics.bufferingEnd()
                            }
                            TVA_Player._bufferingComplete()
                        };
                        TVA_Player._renderingComplete = TVA_Player.renderingComplete;
                        TVA_Player.renderingComplete = function() {
                            TVA_Player._renderingComplete();
                            if (OTTAnalytics.nice264Plugin) {
                                OTTAnalytics.nice264Plugin.stop();
                                OTTAnalytics.nice264Plugin = null
                            }
                        };
                        TVA_Player._onAuthenticationFailed = TVA_Player.onAuthenticationFailed;
                        TVA_Player.onAuthenticationFailed = function() {
                            TVA_Player._onAuthenticationFailed();
                            if (OTTAnalytics.nice264Plugin) {
                                OTTAnalytics.nice264Plugin.error(Nice264AnalyticsError.AUTHENTICATION_FAILED);
                                OTTAnalytics.nice264Plugin.stop();
                                OTTAnalytics.nice264Plugin = null
                            }
                        };
                        TVA_Player._onConnectionFailed = TVA_Player.onConnectionFailed;
                        TVA_Player.onConnectionFailed = function() {
                            TVA_Player._onConnectionFailed();
                            if (OTTAnalytics.nice264Plugin) {
                                OTTAnalytics.nice264Plugin.error(Nice264AnalyticsError.CONNECTION_FAILED);
                                OTTAnalytics.nice264Plugin.stop();
                                OTTAnalytics.nice264Plugin = null
                            }
                        };
                        TVA_Player._onNetworkDisconnected = TVA_Player.onNetworkDisconnected;
                        TVA_Player.onNetworkDisconnected = function() {
                            TVA_Player._onNetworkDisconnected();
                            if (OTTAnalytics.nice264Plugin) {
                                OTTAnalytics.nice264Plugin.error(Nice264AnalyticsError.NETWORK_DISCONNECTED);
                                OTTAnalytics.nice264Plugin.stop();
                                OTTAnalytics.nice264Plugin = null
                            }
                        };
                        TVA_Player._onRenderError = TVA_Player.onRenderError;
                        TVA_Player.onRenderError = function() {
                            TVA_Player._onRenderError();
                            if (OTTAnalytics.nice264Plugin) {
                                OTTAnalytics.nice264Plugin.error(Nice264AnalyticsError.RENDER_ERROR);
                                OTTAnalytics.nice264Plugin.stop();
                                OTTAnalytics.nice264Plugin = null
                            }
                        };
                        TVA_Player._onStreamNotFound = TVA_Player.onStreamNotFound;
                        TVA_Player.onStreamNotFound = function() {
                            TVA_Player._onStreamNotFound();
                            if (OTTAnalytics.nice264Plugin) {
                                OTTAnalytics.nice264Plugin.error(Nice264AnalyticsError.STREAM_NOT_FOUND);
                                OTTAnalytics.nice264Plugin.stop();
                                OTTAnalytics.nice264Plugin = null
                            }
                        }
                    }
                    break;
                case "ps3":
                    OTTAnalytics.nice264Plugin = new Nice264Analytics(window.platform.ver, "totalch", "http://nqs.nice264.com/", j);
                    c = true;
                    if (a) {
                        if (window.platform.ver == 0) {
                            TVA_Player._stop = TVA_Player.stop;
                            TVA_Player.stop = function() {
                                if (OTTAnalytics.nice264Plugin) {
                                    OTTAnalytics.nice264Plugin.stop();
                                    OTTAnalytics.nice264Plugin = null
                                }
                                TVA_Player._stop()
                            };
                            TVA_Player._deinit = TVA_Player.deinit;
                            TVA_Player.deinit = function() {
                                if (OTTAnalytics.nice264Plugin) {
                                    OTTAnalytics.nice264Plugin.stop();
                                    OTTAnalytics.nice264Plugin = null
                                }
                                TVA_Player._deinit()
                            };
                            TVA_Player._pause = TVA_Player.pause;
                            TVA_Player.pause = function(s) {
                                TVA_Player._pause(s);
                                if (s) {
                                    if (OTTAnalytics.nice264Plugin) {
                                        OTTAnalytics.nice264Plugin.pause()
                                    }
                                } else {
                                    if (OTTAnalytics.nice264Plugin) {
                                        OTTAnalytics.nice264Plugin.resume()
                                    }
                                }
                            };
                            TVA_Player.bufferingStart = function() {
                                if (VideoPlayer.hasStarted(true) == true || OTTAnalytics.pendingJoin == 1) {
                                    OTTAnalytics.bufferingBegin()
                                }
                            };
                            TVA_Player.bufferingComplete = function() {
                                if (VideoPlayer.hasStarted(true) == true || OTTAnalytics.pendingJoin == 1) {
                                    OTTAnalytics.pendingJoin = 0;
                                    OTTAnalytics.bufferingEnd()
                                }
                            }
                        } else {
                            window.platform._receiveCommandResponse = window.platform.receiveCommandResponse;
                            window.platform.receiveCommandResponse = function(v) {
                                try {
                                    var s = JSON.parse(v);
                                    var u = [];
                                    switch (s.command) {
                                        case "playerStatusChange":
                                            switch (s.playerState) {
                                                case "buffering":
                                                    if (VideoPlayer.hasStarted(true) == true) {
                                                        OTTAnalytics.bufferingBegin()
                                                    }
                                                    break;
                                                case "playing":
                                                    if (VideoPlayer.hasStarted(true) == true || OTTAnalytics.pendingJoin == 1) {
                                                        OTTAnalytics.pendingJoin = 0;
                                                        OTTAnalytics.bufferingEnd()
                                                    }
                                                    break
                                            }
                                            break;
                                        case "getPlaybackTime":
                                            if (OTTAnalytics.nice264Plugin) {
                                                OTTAnalytics.nice264Plugin.onCurrentPlayTime(s.elapsedTime)
                                            }
                                            break;
                                        case "playerError":
                                            if (OTTAnalytics.nice264Plugin) {
                                                for (k in s) {
                                                    if (s.hasOwnProperty(k)) {
                                                        u.push(s[k])
                                                    }
                                                }
                                                OTTAnalytics.nice264Plugin.error(Nice264AnalyticsError.RENDER_ERROR, u.join(":"));
                                                OTTAnalytics.nice264Plugin.stop();
                                                OTTAnalytics.nice264Plugin = null
                                            }
                                            break;
                                        case "playerStreamingError":
                                            if (OTTAnalytics.nice264Plugin) {
                                                for (k in s) {
                                                    if (s.hasOwnProperty(k)) {
                                                        u.push(s[k])
                                                    }
                                                }
                                                OTTAnalytics.nice264Plugin.error(Nice264AnalyticsError.CONNECTION_FAILED, u.join(":"));
                                                OTTAnalytics.nice264Plugin.stop();
                                                OTTAnalytics.nice264Plugin = null
                                            }
                                            break;
                                        case "networkStatusChange":
                                            if (s.newState == "disconnected") {
                                                if (OTTAnalytics.nice264Plugin) {
                                                    OTTAnalytics.nice264Plugin.error(Nice264AnalyticsError.NETWORK_DISCONNECTED);
                                                    OTTAnalytics.nice264Plugin.stop();
                                                    OTTAnalytics.nice264Plugin = null
                                                }
                                            }
                                            break
                                    }
                                } catch (t) {}
                                window.platform._receiveCommandResponse(v)
                            };
                            window.platform._sendCommand = window.platform.sendCommand;
                            window.platform.sendCommand = function(t) {
                                window.platform._sendCommand(t);
                                try {
                                    switch (t.command) {
                                        case "play":
                                            if (OTTAnalytics.nice264Plugin) {
                                                OTTAnalytics.nice264Plugin.resume()
                                            }
                                            break;
                                        case "pause":
                                            if (OTTAnalytics.nice264Plugin) {
                                                OTTAnalytics.nice264Plugin.synchronous = Main.isInBackground;
                                                OTTAnalytics.nice264Plugin.pause();
                                                OTTAnalytics.nice264Plugin.synchronous = false
                                            }
                                            break;
                                        case "stop":
                                            if (window.platform.videoPlayer.state != "") {
                                                if (OTTAnalytics.nice264Plugin) {
                                                    OTTAnalytics.nice264Plugin.stop();
                                                    OTTAnalytics.nice264Plugin = null
                                                }
                                            }
                                            break
                                    }
                                } catch (s) {}
                            }
                        }
                    }
                    break
            }
            if (!OTTAnalytics.nice264Plugin) {
                return
            }
            var m = null;
            var h = null;
            if (!b.isLive && (b.programId || b.eventId)) {
                h = DataStore.get(Type.Program, b.programId);
                var f = DataStore.get(Type.Event, b.eventId);
                if (f) {
                    m = DataStore.get(Type.Channel, f.channel)
                }
            } else {
                if (b.channelId) {
                    m = DataStore.get(Type.Channel, b.channelId)
                }
            }
            if (typeof OTTAnalytics.nice264Plugin.setLive !== "undefined") {
                OTTAnalytics.nice264Plugin.setLive(b.isLive)
            }
            var d = "";
            try {
                d = navigator.userAgent
            } catch (o) {
                d = ""
            }
            var q = [];
            if (m && m.abrev) {
                q.push(m.abrev)
            } else {
                if (m && m.name) {
                    q.push(m.name)
                }
            }
            if (b.isLive == false && h) {
                var i = "";
                if (h.title) {
                    i = "" + h.title
                }
                if (h.episodeTitle) {
                    var p = "" + h.episodeTitle;
                    if (p.toLowerCase().indexOf(i.toLowerCase()) == 0) {
                        i = p
                    } else {
                        if (p.length > 0) {
                            i += ":" + p
                        }
                    }
                }
                if (h && h.season) {
                    i += "(S." + h.season;
                    if (h.episodePartial) {
                        i += " E." + h.episodePartial
                    }
                    i += ")"
                } else {
                    if (h && h.episodePartial) {
                        i += "(E." + h.episodePartial + ")"
                    }
                }
                q.push(i)
            }
            q = q.join("|");
            var n = {
                content_metadata: {
                    title: q
                },
                quality: "HD",
                content_type: "movie",
                device: {
                    manufacturer: TVA.device,
                    type: TVA.OTT.DEVICETYPE,
                    year: TVA.year,
                    firmware: d
                },
                movie_id: b.assetId,
                filename: g.url
            };
            if (typeof OTTAnalytics.nice264Plugin.setTransactionCode !== "undefined") {
                OTTAnalytics.nice264Plugin.setTransactionCode(g.pbId)
            }
            if (typeof OTTAnalytics.nice264Plugin.setUsername !== "undefined") {
                OTTAnalytics.nice264Plugin.setUsername(this.username)
            }
            if (typeof OTTAnalytics.nice264Plugin.setVideoURL !== "undefined") {
                OTTAnalytics.nice264Plugin.setVideoURL(g.url)
            }
            if (typeof OTTAnalytics.nice264Plugin.setMetadata !== "undefined") {
                OTTAnalytics.nice264Plugin.setMetadata(n)
            }
            OTTAnalytics.pendingJoin = 1;
            var r = new Date();
            OTTAnalytics.nice264Plugin.bufferTimeBegin = r.getTime();
            if (c == true) {
                OTTAnalytics.nice264Plugin.isStartEventSent = true;
                OTTAnalytics.nice264Plugin.start()
            }
        } catch (l) {}
    },
    setCurrentTime: function(a) {
        TVA_Player.setCurrentTime(a);
        if (OTTAnalytics.nice264Plugin) {
            OTTAnalytics.nice264Plugin.assetPlayHead = a
        }
    },
    fillYouboraData: function(m, c) {
        OTTAnalytics.intentos = 0;
        if (OTTAnalytics.enabled == false && TVA.OTT.OTTBALANCER == false) {
            return
        }
        if (typeof youboraData === "undefined") {
            return
        }
        try {
            if (!SmartPlugin) {
                return
            }
            var p = OTTAnalytics.getCommunicationClass(true);
            if (!p) {
                Debug.err("No communication class")
            }
            var n = VideoPlayer.details;
            var g = VideoPlayer.initPlayerResponseVideo;
            youboraData.setHashTitle(true);
            youboraData.setEnableAnalytics(true);
            youboraData.setAccountCode(TVA.OTT.ACODE);
            youboraData.setUsername(OTTAnalytics.username);
            if (SmartPlugin.setUsername) {
                SmartPlugin.setUsername(OTTAnalytics.username)
            }
            if (SmartPlugin.bandwidth && SmartPlugin.bandwidth.username) {
                SmartPlugin.bandwidth.username = youboraData.getUsername()
            }
            youboraData.setTransaction(VideoPlayer.initPlayerResponseVideo.pbId);
            SmartPlugin.transactionCode = youboraData.getTransaction();
            youboraData.setLive(VideoPlayer.details.isLive);
            if (SmartPlugin.setLive) {
                SmartPlugin.setLive(VideoPlayer.details.isLive)
            }
            SmartPlugin.isLive = VideoPlayer.details.isLive;
            var t = null;
            var d = null;
            if (!n.isLive && (n.programId || n.eventId)) {
                d = DataStore.get(Type.Program, n.programId);
                var i = DataStore.get(Type.Event, n.eventId);
                if (i) {
                    t = DataStore.get(Type.Channel, i.channel)
                }
            } else {
                if (n.channelId) {
                    t = DataStore.get(Type.Channel, n.channelId)
                }
            }
            var l = "";
            try {
                l = navigator.userAgent
            } catch (b) {
                l = ""
            }
            var s = [];
            if (t && t.abrev) {
                s.push(t.abrev)
            } else {
                if (t && t.name) {
                    s.push(t.name)
                }
            }
            if (n.isLive == false && d) {
                var j = "";
                if (d.title) {
                    j = "" + d.title
                }
                if (d.episodeTitle) {
                    var h = "" + d.episodeTitle;
                    if (h.toLowerCase().indexOf(j.toLowerCase()) == 0) {
                        j = h
                    } else {
                        if (h.length > 0) {
                            j += ":" + h
                        }
                    }
                }
                if (d && d.season) {
                    j += "(S." + d.season;
                    if (d.episodePartial) {
                        j += " E." + d.episodePartial
                    }
                    j += ")"
                }
                s.push(j)
            }
            s = s.join("|");
            youboraData.setPropertyMetaTitle(s);
            youboraData.setPropertyDeviceManufacturer(TVA.device);
            youboraData.setPropertyDeviceType(TVA.OTT.DEVICETYPE);
            youboraData.setPropertyDeviceYear(TVA.year);
            youboraData.setPropertyDeviceFirmware(l);
            youboraData.setPropertyFileName(g.url);
            youboraData.setPropertyContentId(n.assetId);
            var q = Utils.now();
            var f = {
                balanceType: "balance",
                enabled: TVA.OTT.NICEBALANCER,
                service: "http://smartswitch.youbora.com/",
                zoneCode: "default",
                originCode: TVA.OTT.ORIGINCODE,
                niceNVA: q - (3600 * 1000),
                niceNVB: q + (3600 * 1000),
                token: TVA.OTT.NICETOKEN,
                niceTokenIp: null,
                rnd: q
            };
            f.token = OTTAnalytics.generateToken(f, g.url);
            if (typeof youboraData !== "undefined") {
                youboraData.setBalanceProperties(f)
            }
            if (TVA.OTT.OTTBALANCER) {
                try {
                    OTTAnalytics.intentos++;
                    OTTAnalytics.prepareOTTBalancer(m, c)
                } catch (a) {}
                return
            } else {
                if (OTTAnalytics.enabled == false) {
                    return
                } else {
                    if (TVA.OTT.NICEBALANCER) {
                        if (p) {
                            p.enableBalancer = true
                        }
                        if (SmartPlugin.playInfo && youboraData.balanceProperties) {
                            SmartPlugin.playInfo.zoneCode = youboraData.balanceProperties.zoneCode;
                            SmartPlugin.playInfo.originCode = youboraData.balanceProperties.originCode
                        }
                        if (TVA.OTT.NICEBALANCER) {
                            if (p) {
                                SmartPlugin.balancing = p.enableBalancer
                            } else {
                                SmartPlugin.balancing = true
                            }
                        } else {
                            if (p) {
                                p.enableBalancer = false
                            }
                            SmartPlugin.balancing = false
                        }
                        if (p) {}
                    }
                }
            }
        } catch (o) {}
        c(m);
        try {
            setTimeout(function() {
                Messenger.balancedUrl(m.url)
            }, 100)
        } catch (r) {}
    },
    generateToken: function(h, c) {
        var b = "";
        try {
            var d = TVA.OTT.ACODE;
            var a = "";
            var g = d + h.zoneCode + h.originCode + c + h.niceNVA + h.niceNVB + a;
            b = window.md5(g)
        } catch (f) {}
        return b
    },
    prepareOTTBalancer: function(c, b) {
        if (!c || !c.url) {
            return
        }
        var a = c.url;
        a = a.split("|");
        var d = OTTAnalytics.getResourcePath(a[0]);
        OTTAnalytics.getBalancedResource(d, function(i) {
            OTTAnalytics.balancedCallback = null;
            if (i != false) {
                try {
                    var f = a[0];
                    if (i["1"] && i["1"]["URL"]) {
                        a[0] = i["1"]["URL"]
                    } else {
                        if (i[1] && i[1]["URL"]) {
                            a[0] = i[1]["URL"]
                        }
                    }
                    if (f != a[0]) {} else {}
                    a = a.join("|");
                    c.url = a;
                    if (SmartPlugin) {
                        SmartPlugin.urlResource = c.url
                    }
                } catch (h) {}
            } else {}
            b(c);
            try {
                setTimeout(function() {
                    Messenger.balancedUrl(c.url, i)
                }, 100)
            } catch (g) {}
        })
    },
    getResourcePath: function(a) {
        return a
    },
    getBalancedResource: function(o, j) {
        var i = this;
        this.balancedCallback = j;
        if (typeof youboraData != "undefined") {
            var f = youboraData.getBalanceService();
            var g = youboraData.getBalanceType();
            var h = youboraData.getBalanceZoneCode();
            var b = youboraData.getBalanceOriginCode();
            var l = youboraData.getAccountCode();
            var c = youboraData.getBalanceToken();
            var a = youboraData.getBalanceNVA();
            var n = youboraData.getBalanceNVB();
            try {
                this.xmlHttp = new XMLHttpRequest();
                this.xmlHttp.context = this;
                var e = f + "?type=" + g + "&systemcode=" + l + "&zonecode=" + h + (b != "" ? ("&origincode=" + b) : "") + "&resource=" + encodeURIComponent(o) + "&live=" + (VideoPlayer.details && VideoPlayer.details.isLive ? "true" : "false") + "";
                var m = this;
                m.xmlHttp.addEventListener("load", function(r) {
                    if (m.xmlHttp) {
                        var u = r.target.response.toString();
                        var q = "";
                        var p = false;
                        try {
                            q = JSON.parse(u)
                        } catch (t) {
                            p = true
                        }
                        if (p == false) {
                            i.balancedCallback(q)
                        } else {
                            i.balancedCallback(false)
                        }
                        m.xmlHttp = null;
                        try {
                            clearTimeout(m.xmlHttp.readyStateChangeTimeout)
                        } catch (s) {}
                    }
                }, false);
                m.xmlHttp.onreadystatechange = function() {
                    if (m.xmlHttp) {
                        var p = 0;
                        if (m.xmlHttp.readyState == 1) {
                            p = 3 * 1000
                        } else {
                            if (m.xmlHttp && m.xmlHttp.readyState == 4) {
                                p = 200
                            }
                        }
                        if (p > 0) {
                            if (m.xmlHttp.readyStateChangeTimeout) {
                                try {
                                    clearTimeout(m.xmlHttp.readyStateChangeTimeout)
                                } catch (q) {}
                            }
                            m.xmlHttp.readyStateChangeTimeout = setTimeout(function() {
                                if (m.xmlHttp && m.xmlHttp.readyState == 4) {
                                    i.balancedCallback(false);
                                    m.xmlHttp = null
                                }
                            }, p)
                        }
                    }
                };
                this.xmlHttp.open("GET", e, true);
                this.xmlHttp.send()
            } catch (d) {}
        }
    }
};
