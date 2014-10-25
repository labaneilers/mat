/*! skinny.js v0.1.0 | Copyright 2013 Vistaprint | vistaprint.github.io/SkinnyJS/LICENSE 
http://vistaprint.github.io/SkinnyJS/download-builder.html?modules=jquery.cookies,jquery.delimitedString,jquery.queryString,jquery.url*/

(function ($) {

    $.cookies = {};

    // Encodes a cookie text value, making sure to replace %20 with +
    // and + with %2b. This is done because %20 gets lost going to the
    // server.
    // @param {string} sText The text to encode.
    // @return {string} The encoded text.
    var _cookieEncode = function (sText) {
        if (!sText) {
            return "";
        } else {
            sText = sText.toString();
        }

        // first urlencode
        sText = encodeURIComponent(sText);

        // then replace + and space
        sText = sText.replace(/\+/gi, "%2B").replace(/\%20/gi, "+");

        // return the text
        return sText;
    };

    // Decodes a cookie text value, making sure to replace + with %20
    // and %2b with +. This undoes _cookieEncode().
    // @param {string} sText The text to decode.
    // @return {string} The decoded text.
    var _cookieDecode = function (sText) {
        if (!sText) {
            return "";
        } else {
            sText = sText.toString();
        }

        // first replace + and space
        sText = sText.replace(/\+/gi, "%20").replace(/\%2B/gi, "+");

        // now urldecode
        return decodeURIComponent(sText);
    };

    var _defaultPermanentDate = function () {
        var d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        return d.toUTCString();
    };

    var _defaults = {
        domain: null,
        path: "/",
        permanentDate: _defaultPermanentDate(),
        watcher: $.noop
    };

    var _settings = _defaults;

    $.cookies.setDefaults = function (settings) {
        _settings = $.extend({}, _defaults, settings);
    };

    var _getDefault = function (key, overrideValue) {
        if (overrideValue) {
            return overrideValue;
        }

        return _settings[key];
    };

    // Runs a test to determine if cookies are enabled on the browser.
    // @return {boolean} True if cookies are enabled, false if not.
    $.cookies.enabled = function () {
        $.cookies.set("cookietest", "value");
        if ($.cookies.get("cookietest") == "value") {
            $.cookies.remove("cookietest");
            return true;
        } else {
            return false;
        }
    };

    // Gets a cookie or sub-cookie value.
    // @param {string} name The name of the cookie
    // @param {string} subCookie Optional. The sub-cookie value to get
    // @return {string} or {object} (if the cookie contains subvalues)
    $.cookies.get = function (name, /* optional */ subCookie) {
        var cookies = new Cookies();
        var cookie = cookies[name];
        if (cookie) {
            if (subCookie) {
                if (cookie.subCookies) {
                    return cookie.subCookies[subCookie] || null;
                }

                return null;
            }

            if (cookie.subCookies) {
                return cookie.subCookies;
            } else {
                return cookie.value || "";
            }
        }

        return null;
    };

    // Sets a cookie value.
    // @param {string} or {object} nameOrData The name of the cookie or an object containing the arguments.
    // @param {string} or {object} value The value to set. Either a single value or an object of key value pairs.
    // @param {string} domain (Optional) The domain in which to store the cookie. Uses the default domain if not specified.
    // @param {Boolean} permanent (Optional) Indicates the cookie should be permanent. False by default.
    // @param {Boolean} clearExistingSubCookies (Optional) If true, all sub-cookoies will be erased before writing new ones. False by default.
    $.cookies.set = function (nameOrData, value, domain, permanent, clearExistingSubCookies) {
        var name = nameOrData;
        var path;

        if (typeof (nameOrData) == "object") {
            name = nameOrData.name;
            value = nameOrData.value;
            domain = nameOrData.domain;
            permanent = nameOrData.permanent;
            path = nameOrData.path;
            clearExistingSubCookies = nameOrData.clearExistingSubCookies || nameOrData.clearExisting;
        }

        // value may be a map of subvalues.
        var subCookies;
        if (typeof (value) == "object" && value !== null) {
            subCookies = value;
            value = null;
        }

        // Check for an existing cookie. If not, create it.
        var cookie = (new Cookies())[name];
        if (!cookie) {
            cookie = new Cookie();
            cookie.name = name;
        }

        cookie.value = value;

        if (subCookies) {
            if (clearExistingSubCookies || !cookie.subCookies) {
                cookie.subCookies = subCookies;
            } else {
                // Subcookies should be merged into the existing ones.
                for (var subCookie in subCookies) {
                    if (subCookies.hasOwnProperty(subCookie)) {
                        cookie.subCookies[subCookie] = subCookies[subCookie];
                    }
                }
            }
        }

        cookie.domain = _getDefault("domain", domain);
        cookie.path = _getDefault("path", path);
        cookie.isPermanent = !! permanent;

        cookie.save();
    };

    // Deletes the cookie with the specified name.
    // @param {string} sName The name of the cookie to delete.
    $.cookies.remove = function (name, domain, path) {
        var cookie = _cookieEncode(name) + "=a; path=" + _getDefault("path", path) + "; expires=Wed, 17 Jan 1979 07:01:00 GMT";

        domain = _getDefault("domain", domain);
        if (domain) {
            cookie += "; domain=" + domain;
        }

        _settings.watcher(cookie);

        document.cookie = cookie;
    };

    // @class Represents a collection of cookies stored in the browser.
    // Exposes the cookies as a dictionary of cookie names and cookie objects.
    var Cookies = function () {
        var me = this;
        var cookie = document.cookie.toString();
        var cookieArray = cookie.split(";");

        var iLen = cookieArray.length;
        for (var i = 0; i < iLen; i++) {
            var oCookie = new Cookie();
            oCookie.parse(cookieArray[i]);
            if (oCookie.name) {
                me[oCookie.name] = oCookie;
            }
        }
    };

    // @class Represents a cookie. Contains a value or a subvalues collection.
    // @constructor
    var Cookie = function () {
        var me = this;

        // The name of the cookie
        this.name = null;

        // A collection of sub-values for the cookie. Null if there is a single value
        this.subCookies = null;


        // The value of the cookie. Null if there is a collection of sub-values
        this.value = null;


        // The domain of the cookie. If null, the default domain is used.
        this.domain = null;

        // The path of the cookie. If null, the default path / is used.
        this.path = null;

        // Indicates the cookie persists on users machines
        this.isPermanent = false;

        var _validateName = function () {
            if (!me.name) {
                throw new Error("Cookie: Cookie name is null.");
            }
        };


        // Gets the cookie as a serialized string
        // @return {String}
        this.serialize = function () {
            _validateName();

            var cookie = _cookieEncode(me.name) + "=" + _getEncodedValue();

            cookie += "; path=" + _getDefault("path", this.path);

            var domain = _getDefault("domain", me.domain);
            if (domain) {
                cookie += "; domain=" + domain;
            }

            if (me.isPermanent) {
                cookie += "; expires=" + _getDefault("permanentDate");
            }

            return cookie;
        };


        // Saves the value of the cookie- commits it to the browser's cookies.
        this.save = function () {
            _validateName();

            var cookie = me.serialize();
            _settings.watcher(cookie);

            document.cookie = cookie;
        };


        // Takes the encoded value of the cookie as it is stored on disk, and populates the object with it.
        // @param {string} sUnparsedValue The encoded cookie data
        this.parse = function (sUnparsedValue) {
            if (!sUnparsedValue) {
                return;
            }

            //trim the raw string off the leading and trailing spaces
            sUnparsedValue = sUnparsedValue.replace(/^\s*(.*?)\s*$/, "$1");

            //The name of the cookie is the value before the first "="
            var iPosEquals = sUnparsedValue.indexOf("=");
            if (iPosEquals <= 0) {
                return;
            }

            me.name = _cookieDecode(sUnparsedValue.substr(0, iPosEquals));

            var sValue = sUnparsedValue.substr(iPosEquals + 1);
            if (sValue.indexOf("=") == -1) {
                me.value = _cookieDecode(sValue);
                return;
            }

            me.subCookies = {};

            var aSubCookies = sValue.split("&");
            var iLen = aSubCookies.length;
            for (var i = 0; i < iLen; i++) {
                var aSubCookie = aSubCookies[i].split("=");
                if (aSubCookie.length != 2) {
                    me.subCookies = null;
                    return;
                } else {
                    me.subCookies[_cookieDecode(aSubCookie[0])] = _cookieDecode(aSubCookie[1]);
                }
            }
        };


        // Gets the encoded value of the cookie (handles subcookies too).
        var _getEncodedValue = function () {
            if (me.subCookies) {
                var aOut = [];
                for (var sSub in me.subCookies) {
                    aOut.push(_cookieEncode(sSub) + "=" + _cookieEncode(me.subCookies[sSub]));
                }
                return aOut.join("&");
            } else {
                return _cookieEncode(me.value);
            }
        };


    };

})(jQuery);
;(function ($) {

    // Takes a plain javascript object (key value pairs), and encodes it as a string 
    // using the specified delimiters and encoders
    $.encodeDelimitedString = function (data, itemDelimiter, pairDelimiter, keyEncoder, valueEncoder) {
        if (!data) {
            return "";
        }

        keyEncoder = keyEncoder || function (s) {
            return s;
        };
        valueEncoder = valueEncoder || keyEncoder;

        var sb = [];

        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                sb.push(keyEncoder(key) + pairDelimiter + valueEncoder(data[key]));
            }
        }

        return sb.join(itemDelimiter);
    };

    // Takes an encoded string, and parses it into a plain javascript object (key value pairs)
    // using the specified delimiters and decoders
    $.parseDelimitedString = function (delimitedString, itemDelimiter, pairDelimiter, keyDecoder, valueDecoder) {
        keyDecoder = keyDecoder || function (s) {
            return s;
        };
        valueDecoder = valueDecoder || keyDecoder;

        var ret = {};

        if (delimitedString) {
            var pairs = delimitedString.split(itemDelimiter);
            var len = pairs.length;
            for (var i = 0; i < len; i++) {
                var pair = pairs[i];

                if (pair.length > 0) {
                    var delimIndex = pair.indexOf(pairDelimiter);
                    var key, value;

                    if (delimIndex > 0 && delimIndex <= pair.length - 1) {
                        key = pair.substring(0, delimIndex);
                        value = pair.substring(delimIndex + 1);
                    } else {
                        key = pair;
                    }

                    ret[keyDecoder(key)] = valueDecoder(value);
                }
            }
        }

        return ret;
    };

})(jQuery);
;/// <reference path="jquery.delimitedString.js" ></reference>

(function ($) {
    var PLUS_RE = /\+/gi;

    var urlDecode = function (s) {
        // Specifically treat null/undefined as empty string
        if (s == null) {
            return "";
        }

        // Replace plus with space- jQuery.param() explicitly encodes them,
        // and decodeURIComponent explicitly does not.
        return decodeURIComponent(s.replace(PLUS_RE, " "));
    };

    // Given a querystring (as a string), deserializes it to a javascript object.
    $.deparam = function (queryString) {
        if (typeof queryString != "string") {
            throw new Error("$.deparam() expects a string for 'queryString' argument.");
        }

        // Remove "?", which starts querystrings
        if (queryString && queryString.charAt(0) == "?") {
            queryString = queryString.substring(1, queryString.length);
        }

        return $.parseDelimitedString(queryString, "&", "=", urlDecode);
    };

    // Alias
    $.parseQueryString = $.deparam;

    // Gets the querystring from the current document.location as a javascript object.
    $.currentQueryString = function () {
        return $.deparam(window.location.search);
    };

    // Given a url (pathname) and an object representing a querystring, constructs a full URL
    $.appendQueryString = function (url, parsedQueryString) {
        var qs = $.param(parsedQueryString);
        if (qs.length > 0) {
            qs = "?" + qs;
        }

        return url + qs;
    };

})(jQuery);
;/// <reference path="jquery.queryString.js" ></reference>

(function ($) {

    // Parses and manipulates a URL. 
    $.Url = function (url) {
        var me = this;

        var _normalize = function (input) {
            if (input == null || input === "") {
                return "";
            }

            return input.toString();
        };

        // http: or https:
        var _protocol = "";

        this.protocol = function (value) {
            if (typeof value != "undefined") {
                _protocol = _normalize(value);

                if (_protocol) {
                    if (_protocol.charAt(_protocol.length - 1) != ":") {
                        _protocol += ":";
                    }
                }
            } else {
                return _protocol;
            }
        };

        // The server name- example: www.vistaprint.com
        var _hostname = "";

        this.hostname = function (value) {
            if (typeof value != "undefined") {
                _hostname = _normalize(value);
            } else {
                return _hostname;
            }
        };

        var _port = "";

        // The TCP port (if specified)
        this.port = function (value) {
            if (typeof value != "undefined") {
                _port = _normalize(value);
            } else {
                return _port;
            }
        };

        // The server name- example: www.vistaprint.com
        // Includes port string if specified- example www.vistaprint.com:80
        this.host = function (value) {
            if (typeof value != "undefined") {
                value = _normalize(value);

                // Separate hostname & port from host
                if (value) {
                    var colonPos = value.indexOf(":");
                    if (colonPos != -1) {
                        _hostname = value.substr(0, colonPos);
                        _port = value.substr(colonPos + 1, value.length);
                    } else {
                        _hostname = _normalize(value);
                        _port = "";
                    }
                } else {
                    _hostname = "";
                    _port = "";
                }
            } else {
                var out = _hostname;
                if (_port) {
                    out += ":" + _port;
                }
                return out;
            }
        };

        var _pathname = "";

        // The root relative path to the file- example: /vp/myfile.htm
        this.pathname = function (value) {
            if (typeof value != "undefined") {
                _pathname = _normalize(value);
            } else {
                return _pathname;
            }
        };

        // The querystring- example: val1=foo&val2=bar
        this.queryString = {};

        // The querystring with the initial ? if specified- example: ?val1=foo&val2=bar
        this.search = function (value) {
            if (typeof value != "undefined") {
                value = _normalize(value);
                me.queryString = $.deparam(value);
            } else {
                var qs = $.param(me.queryString);
                return qs ? "?" + qs : qs;
            }
        };

        // The anchor link- text after the # character
        var _hash = "";

        this.hash = function (value) {
            if (typeof value != "undefined") {
                value = _normalize(value);

                // Always ensure there is a # for any non-empty string
                if (value.length > 0) {
                    if (value.charAt(0) != "#") {
                        value = "#" + value;
                    }
                }
                _hash = value;
            } else {
                return _hash;
            }
        };

        var load = function (url) {
            var nextPartPos;
            var temp = url;

            // protocol: "http:" or "https:"
            if (temp.search(/https\:\/\/+/i) === 0) //The ending + is to prevent comment removers from messing up this line
            {
                _protocol = "https:";
                temp = url.substr(8);
            } else if (temp.search(/http\:\/\/+/i) === 0) //The ending + is to prevent comment removers from messing up this line
            {
                _protocol = "http:";
                temp = url.substr(7);
            }

            if (temp.length === 0) {
                return;
            }

            // host: contains hostname and port if specified (i.e. www.vistaprint.com:80)
            if (_protocol !== "") {
                //match a slash, hash, colon, or question mark
                nextPartPos = temp.search(/[\/\?\#]/i);
                if (nextPartPos == -1) {
                    me.host(temp);
                    return;
                }

                me.host(temp.substring(0, nextPartPos));
                temp = temp.substr(nextPartPos);
            }

            if (temp.length === 0) {
                return;
            }

            nextPartPos = temp.search(/[\?\#]/i);

            //pathname: i.e. /vp/mypage.htm
            if (nextPartPos !== 0) {
                if (nextPartPos == -1) {
                    _pathname = temp;
                    return;
                }

                _pathname = temp.substr(0, nextPartPos);
                temp = temp.substr(nextPartPos);
            }

            if (temp.length === 0) {
                return;
            }

            // queryString (i.e. myval1=1&myval2=2)
            // search: same as querystring with initial question mark (i.e. ?myval1=1&myval2=2)
            if (temp.indexOf("?") === 0) {
                nextPartPos = temp.indexOf("#");

                if (nextPartPos == -1) {
                    me.queryString = $.deparam(temp.substr(1));
                    temp = "";
                } else {
                    me.queryString = $.deparam(temp.substring(1, nextPartPos));
                    temp = temp.substr(nextPartPos);
                }
            }

            if (temp.length === 0) {
                return;
            }

            //hash (i.e. anchor link- #myanchor)
            if (temp.indexOf("#") === 0) {
                _hash = temp;
            }
        };

        // Gets the URL as a string
        this.toString = function () {
            var url = "";
            var host = me.host();
            if (host) {
                url = (_protocol || "http:") + "//" + me.host();
            }
            return url + me.pathname() + me.search() + me.hash();
        };

        // Gets a specific querystring value from its key name
        this.get = function (key, defaultValue) {
            if (!me.queryString.hasOwnProperty(key)) {
                return defaultValue;
            }

            return _normalize(me.queryString[key]);
        };

        // Sets a specific querystring value by its key name
        this.set = function (key, value) {
            if (key == null || key === "") {
                throw new Error("Invalid key: " + key);
            }

            me.queryString[key] = value;
        };

        // Removes a specific querystring value by its key name
        this.remove = function (key) {
            delete me.queryString[key];
        };


        this.getItemOrDefault = this.get;
        this.getOrDefault = this.get;
        this.getItem = this.get;
        this.setItem = this.set;
        this.removeItem = this.remove;

        load(url ? url.toString() : "");
    };

})(jQuery);
