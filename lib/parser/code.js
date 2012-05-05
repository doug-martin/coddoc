(function () {
    "use strict";
    var util = require("../util.js");

    var handlers = [];

    var createFunctionRet = function (activeScope, name, params, str) {
        return {
            type:'function',
            isFunction:true,
            isPrivate:name.match(/^_/) !== null,
            name:name,
            memberof:activeScope,
            isStatic:activeScope ? !activeScope.match(".prototype") : false,
            params:params,
            code:['function (', params.map(
                function (n) {
                    return n.name.name;
                }).join(","), '){\n   ', util.getCode(str, "{").split("\n").join("\n   "), "\n}"].join("")
        };
    };

    var createPropertyRet = function (activeScope, name, code, str) {
        var match = code.match(/^(\[|\{)/);
        if (match && match.length === 2) {
            code = util.getCode(str, match[1], null, true);
        }
        return {
            type:'property',
            isFunction:false,
            memberof:activeScope,
            isStatic:activeScope ? !activeScope.match(".prototype") : false,
            isPrivate:name.match(/^_/) !== null,
            name:name,
            code:code
        };
    };

    /**
     * Uses Registered handlers to parse the next block of code from a code fragment. This function is
     * used by {@link coddoc.parse} to parse code for comments.
     *
     * @protected
     * @memberof coddoc
     * @param {String} str the source string to parse
     * @param {coddoc.Symbol} symbol the symbol to add parsed properties from.
     * @param {coddoc.Context} context the current context
     */
    exports.parseCode = function (str, symbol, context) {
        var l = handlers.length, ret = {};
        for (var i = 0; i < l; i++) {
            var h = handlers[i];
            if (h.match(str)) {
                ret = h.parse(str, symbol, context);
                break;
            }
        }
        if (ret) {
            symbol.codeObject = ret;
            Object.keys(ret).forEach(function (i) {
                symbol[i] = ret[i];
            });
        }
    };

    var sortHandlers = function (a, b) {
        return b.priority - a.priority;
    };

    /**
     * Adds a handler for a particular code regular expression. Useful if you want to
     * match a specific type of code not handled by default. When inside of of the parse function
     * you can use the <code>RegExp.$</code> properties to access match sub expressions.
     *
     * By Default code blocks of the following form are parsed.
     *
     * <pre>
     * // /^function (\w+) *\{/
     * function(){}
     *
     * // /^var *(\w+) *= *function/
     * var x = function(){};
     *
     * // /^(\w+(?:\.\w+)*)\.prototype\.(\w+(?:\.\w+)?) *= *function/
     * MyObject.prototype.testFunction = function(){};
     *
     * // /^(\w+(?:\.\w+)*)\.prototype\.(\w+(?:\.\w+)?) *= *([^\n;]+)/
     * MyObject.prototype.testProperty = "property";
     *
     * // /^(\w+(?:\.\w+)+) *= *function/
     * some.object.testFunction = function(){}
     *
     * // /^(\w+(?:\.\w+)+) *= *([^\n;]+)/
     * some.object.testFunction = ["some", "property"];
     *
     * // /^var +(\w+) *= *([^\n;]+)/
     * var testProperty = {my : "property"};
     *
     * var myObject = {
     *    // /^\"?(\w+)\"? *\: *function/
     *    testFunction : function(){},
     *
     *    // /^\"?(\w+)\"? *\: *([^,\n]+)/
     *    testProperty : "some property"
     * }
     * </pre>
     *
     * @example
     * var util = require("coddoc").util;
     * //parse code in the format of var myLocal = name.space.myFunction = function(){};
     * //give it a high priority to allow it to override current handlers.
     * addHandler(/^var *\w+ *= * (\w+(?:\.\w+)*) = *function/, 20, function (str, symbol, context) {
     *      var splitName = util.splitName(RegExp.$1), name = splitName.name, activeScope = splitName.memberof, params = util.getParamList(str);
     *      return {
     *          type:'function',
     *          isFunction:true,
     *          memberof:activeScope,
     *          isStatic:activeScope ? !activeScope.match(".prototype") : false,
     *          isPrivate:name.match(/^_/) != null,
     *          name:name,
     *          params:params,
     *          code:['function (', params.map(
     *              function (n) {
     *                  return n.name.name;
     *              }).join(","), '){\n   ', util.getCode(str, "{").split("\n").join("\n   "), "\n}"].join("")
     *     };
     * });
     *
     * @memberof coddoc
     *
     * @param {RegExp} regexp the regular expression used to match code blocks.
     * @param {Number} [priority=0] the priority to give this code handler if not provided
     * it is defaulted to 0.
     * @param {Function} parse a function that returns an object. The object will be set as the <code>codeObject</code>
     * on the {@link coddoc.Symbol}. The properties of the object will be added to the {@link coddoc.Symbol} for
     * processing later.
     *
     *
     */
    exports.addCodeHandler = function (regexp, priority, parse) {
        if (util.isFunction(priority)) {
            parse = priority;
            priority = 0;
        }
        handlers.push({
            priority:priority,
            match:function (str) {
                return regexp.exec(str);
            },
            parse:parse
        });
        handlers.sort(sortHandlers);
    };

    var addHandler = exports.addCodeHandler;

    addHandler(/^function +(\w+) *\([^\)]*\) *\{/, 9, function (str, symbol, context) {
        var params = util.getParamList(str), name = RegExp.$1;
        return createFunctionRet("", name, params, str);
    });

    addHandler(/^var *(\w+) *= *function/, 8, function (str, symbol, context) {
        var params = util.getParamList(str), name = RegExp.$1, activeScope = context.getActiveScopeName();
        return createFunctionRet(activeScope, name, params, str);
    });

    addHandler(/^(\w+(?:\.\w+)+) *= *function/, 5, function (str) {
        var splitName = util.splitName(RegExp.$1), name = splitName.name, activeScope = splitName.memberof, params = util.getParamList(str);
        return createFunctionRet(activeScope, name, params, str);
    });

    addHandler(/^(\w+(?:\.\w+)+) *= *([^\n;]+)/, 4, function (str) {
        var splitName = util.splitName(RegExp.$1), name = splitName.name, activeScope = splitName.memberof, code = RegExp.$2;
        return createPropertyRet(activeScope, name, code, str);
    });

    addHandler(/^var +(\w+) *= *([^\n;]+)/, 3, function (str, symbol, context) {
        var activeScope = context.getActiveScopeName(), name = RegExp.$1;
        var code = RegExp.$2, match = code.match(/^(\[|\{)/);
        if (match && match.length === 2) {
            code = util.getCode(str, match[1], null, true);
        }
        return {
            type:'declaration',
            isFunction:false,
            isPrivate:RegExp.$1.match(/^_/) !== null,
            memberof:activeScope,
            isStatic:activeScope ? !activeScope.match(".prototype") : false,
            name:name,
            code:code
        };
    });

    addHandler(/^\"?(\w+)\"? *\: *function/, 2, function (str, symbol, context) {
        var params = util.getParamList(str), activeScope = context.getActiveScopeName(), name = RegExp.$1;
        return createFunctionRet(activeScope, name, params, str);
    });

    addHandler(/^\"?(\w+)\"? *\: *([^,\n]+)/, 1, function (str, symbol, context) {
        var activeScope = context.getActiveScopeName(), name = RegExp.$1, code = RegExp.$2;
        return createPropertyRet(activeScope, name, code, str);
    });
}());
