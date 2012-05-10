(function () {
    "use strict";
    var tags = require("../parser/tags.js"),
        parseTag = tags.parseTag,
        util = require("../util.js"),
        Symbol = require("../symbol.js"),
        code = require("./code.js");


    var joinAndReplace = function (str) {
        return str.replace(/^\s*\*\s?/, "");
    };

    var parseCode = function (str, startIndex, symbol, context) {
        startIndex = util.findNextTokenIndex(str, startIndex);
        code.parseCode(str.substr(startIndex), symbol, context);
    };

    /**
     * Parses tags from a comment string.
     *
     * @ignore
     *
     * @param commentObj
     * @param code
     * @param filepath
     * @param context
     * @param emitter
     * @return {Object}
     */
    var parseTags = function (commentObj, code, filepath, context, emitter) {
        var tagRegexp = tags.getTagRegexp();
        var sym = new Symbol({file:filepath});
        var comment = commentObj.comment,
            match = tagRegexp.exec(comment), description,
            l = comment.length, i;
        if (match && match[1]) {
            parseCode(code, commentObj.end, sym, context);
            i = match.index;
            sym.description = comment.substr(0, i);
            comment = comment.substr(i);
            i = 0;
            while (i < l) {
                var subComment = comment.substr(i), nextIndex;
                match = tagRegexp.exec(comment.substr(i + 2));
                if (match && match[1]) {
                    nextIndex = match.index;
                    nextIndex += i + 1;
                    parseTag(comment.substr(i, nextIndex - i), sym, context);
                    i = nextIndex;
                } else {
                    parseTag(subComment, sym, context);
                    i = l;
                }
            }
        } else {
            parseCode(code, commentObj.end, sym, context);
            sym.description = comment;
        }
        sym.fullName = sym.memberof ? [sym.memberof, sym.name].join(".") : sym.name;
        return {symbol:sym, comment:comment};
    };

    /**
     * Parses a string of code into {@link coddoc.Symbol}s. All processed symbols are added to the {@link coddoc.Tree}.
     * This method is not intended to be used directly by user code.
     *
     * @memberof coddoc
     * @protected
     *
     * @param {String} str the source code to parse
     * @param {String} filepath the relative filepath where the source is located. This is set on the symbol during parsing.
     * @param {coddoc.Tree} tree the tree which contains all symbols.
     * @param {coddoc.Context} context the context which holds information about the current parsing job.
     *
     * @return {Object}
     */
    exports.parse = function (str, filepath, tree, context, emitter) {
        var l = str.length;
        var symbols = [];
        for (var i = 0; i < l; i++) {
            var tags = [];
            var comment = "", c = str[i], startIndex = i, endIndex, ret = [];
            var startCIndex = str.indexOf("/**", i);
            if (startCIndex !== -1) {
                i = startCIndex + 2;
                var endCIndex = str.indexOf("*/", i);
                if (endCIndex !== -1) {
                    comment = str.substr(startCIndex + 2, endCIndex - (startCIndex + 2)).split("\n").map(joinAndReplace).join("\n");
                    emitter.emit("comment", comment);
                    i = endCIndex + 1;
                    //console.log(str.substr(startCIndex, endCIndex - startCIndex));
                    //console.log(comment);
                    var res = parseTags({comment:comment, start:startCIndex, end:endCIndex + 2}, str, filepath, context),
                        sym = res.symbol;
                    symbols.push(sym);
                    emitter.emit("symbol", sym);
                    var memberof = sym.memberof;
                    if (!sym.ignore && !sym.lends) {
                        tree.addSymbol(sym);
                    }
                }
            } else {
                i++;
            }

        }
        return {symbols:symbols, code:str};
    };

    exports.addTagHandler = tags.addTagHandler;
    exports.addCodeHandler = tags.addCodeHandler;
    exports.parseTag = tags.parseTag;
    exports.tags = tags.tags;
}());


