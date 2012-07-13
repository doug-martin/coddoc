(function () {
    "use strict";
    var WHITE_SPACE_REG = /[\s|\n|\r|\t]/;


    exports.isString = function (obj) {
        var undef;
        return obj !== undef && (typeof obj === "string" || obj instanceof String);
    };

    exports.isFunction = function (obj) {
        return typeof obj === "function";
    };


    exports.isNumber = function (obj) {
        var undef;
        return obj !== undef && obj !== null && (typeof obj === "number" || obj instanceof Number);
    };

    exports.isObject = function (obj) {
        var undef;
        return obj !== null && obj !== undef && typeof obj === "object";
    };

    exports.resolveName = function (name, multi) {
        var ret = !multi ? name.replace(/#/g, ".prototype.") : name;
        if (ret.match(/prototype\.$/)) {
            ret = ret.split(".");
            ret.pop();
            ret = ret.join(".");
        }
        return ret.trim();
    };

    exports.isRegExp = function (obj) {
        var undef;
        return obj !== undef && obj !== null && (obj instanceof RegExp);
    };

    exports.escapeString = function (/*String*/str, /*String?*/except) {
        return str.replace(/([\.$?*|{}\(\)\[\]\\\/\+\^])/g, function (ch) {
            if (except && except.indexOf(ch) !== -1) {
                return ch;
            }
            return "\\" + ch;
        }); // String
    };

    var merge = function (target, source) {
        var name, s;
        Object.keys(source).forEach(function (name) {
            s = source[name];
            if (!(name in target) || (target[name] !== s)) {
                target[name] = s;
            }
        });
        return target;
    };
    exports.merge = function (obj, props) {
        if (!obj) {
            obj = {};
        }
        for (var i = 1, l = arguments.length; i < l; i++) {
            merge(obj, arguments[i]);
        }
        return obj; // Object
    };

    exports.splitName = function (name) {
        var parts = name.split("."), ret = {memberof:null, name:name};
        if (parts.length > 1) {
            ret.name = parts.pop();
            ret.memberof = parts.join(".");
        }
        return ret;
    };


    exports.findPreviousToken = function (str, startIndex) {
        var l = startIndex || str.length, ret = null;
        for (; l >= 0; l--) {
            var c = str[l];
            if (!WHITE_SPACE_REG.test(c)) {
                ret = c;
                break;
            }
        }
        return ret;
    };

    exports.findNextToken = function (str, startIndex, endIndex) {
        startIndex = startIndex || 0;
        endIndex = endIndex || str.l;
        var ret = null, l = str.length;
        if (endIndex > l) {
            endIndex = l;
        }
        for (; startIndex < endIndex; startIndex++) {
            var c = str[startIndex];
            if (!WHITE_SPACE_REG.test(c)) {
                ret = c;
                break;
            }
        }
        return ret;
    };

    var findNextTokenIndex = exports.findNextTokenIndex = function (str, startIndex, endIndex) {
        startIndex = startIndex || 0;
        endIndex = endIndex || str.length;
        var ret = null, l = str.length;
        if (!endIndex || endIndex > l) {
            endIndex = l;
        }
        for (; startIndex < endIndex; startIndex++) {
            var c = str[startIndex];
            if (!WHITE_SPACE_REG.test(c)) {
                ret = startIndex;
                break;
            }
        }
        return ret;
    };

    exports.getParamList = function (str) {
        var ret = exports.getTokensBetween(str, "(").join("").split(",").map(
            function (s) {
                return {name:{name:s.trim()}};
            }).filter(function (s) {
                return s.name.name;
            });
        return ret;
    };

    exports.getTypeList = function (str, startIndex) {
        return exports.getTokensBetween(str, startIndex, "{").join("").split("|").map(function (s) {
            return s.trim();
        });
    };

    var TOKEN_INVERTS = {
        "{":"}",
        "}":"{",
        "(":")",
        ")":"(",
        "[":"]"
    };

    exports.getTokensBetween = function (str, start, stop, includeStartEnd) {
        var depth = 0, ret = [];
        if (!start) {
            start = TOKEN_INVERTS[stop];
            depth = 1;
        }
        if (!stop) {
            stop = TOKEN_INVERTS[start];
        }
        var startPushing = false, token, cursor = 0;
        while ((token = str[cursor])) {
            if (token === start) {
                depth++;
                if (!startPushing) {
                    startPushing = true;
                    if (includeStartEnd) {
                        ret.push(token);
                    }
                } else {
                    ret.push(token);
                }
            } else if (token === stop && cursor) {
                depth--;
                if (depth === 0) {
                    if (includeStartEnd) {
                        ret.push(token);
                    }
                    break;
                }
                ret.push(token);
            } else if (startPushing) {
                ret.push(token);
            }
            cursor++;
        }
        return ret;
    };

    exports.getCode = function (str, start, stop, includeStartEnd) {
        var between = exports.getTokensBetween(str, start, stop, includeStartEnd).join("").split("\n");
        //remove start otken and extraneous white space
        var tokenStr = [], initialWhiteSpace = null;
        between.forEach(function (token) {
            var data = token.replace(/</g, "&lt;");
            if (data && initialWhiteSpace === null) {
                var match = data.match(/^(\s*)/);
                if (match.length) {
                    initialWhiteSpace = match[1];
                }
            }
            if (initialWhiteSpace !== null) {
                data = data.replace(initialWhiteSpace, "");
            }
            if (data) {
                tokenStr.push(data);
            }
        });
        return tokenStr.join("\n");
    };


    exports.nameToLink = function (name) {
        return "#" + name.replace(/\./g, "_");
    };
})();

