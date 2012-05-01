var tags = require("../parser/tags.js"),
    util = require("../util.js"),
    Symbol = require("../symbol.js"),
    code = require("./code.js");


var TAG_REGEXP = /@(\w+)/;
var parseTag = function (part, index, sym, src, context) {
    var type = part.match(TAG_REGEXP), ret = {};
    if (type && type.length == 2) {
        ret = tags.parseTag(type[1], part, sym, context, index, src);
    }
    return ret;
};

var parseCode = function (str, startIndex, symbol, context) {
    startIndex = util.findNextTokenIndex(str, startIndex);
    code.parseCode(str.substr(startIndex), symbol, context);
}


var parseTags = function (commentObj, code, filepath, context) {
    //var code = content.replace(/\n/g, " ");
    var tagRegexp = tags.getTagRegexp();
    var sym = new Symbol({file:filepath});
    var comment = commentObj.comment,
        match = tagRegexp.exec(comment), description,
        commentParts = [],
        l = comment.length, i;
    if (match && match[1]) {
        if (match[1] != "lends") {
            parseCode(code, commentObj.end, sym, context)
        }
        i = match.index;
        sym.description = comment.substr(0, i);
        comment = comment.substr(i), i = 0;
        while (i < l) {
            var subComment = comment.substr(i), match = tagRegexp.exec(comment.substr(i + 2)), tag, nextIndex
            if (match && match[1]) {
                nextIndex = match.index;
                nextIndex += i + 1;
                parseTag(comment.substr(i, nextIndex - i), i, sym, code, context);
                i = nextIndex;
            } else {
                parseTag(subComment, i, sym, code, context);
                i = l;
            }
        }
    } else {
        parseCode(code, commentObj.end, sym, context)
        sym.description = comment;
    }
    sym.fullName = sym.memberof ? [sym.memberof, sym.name].join(".") : sym.name;
    return sym;
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
exports.parse = function (str, filepath, tree, context) {
    var l = str.length;
    var symbols = [];
    for (var i = 0; i < l; i++) {
        var tags = [];
        var comment = "", c = str[i], startIndex = i, endIndex, ret = [];
        var startCIndex = str.indexOf("/**", i);
        if (startCIndex != -1) {
            i = startCIndex + 2;
            var endCIndex = str.indexOf("*/", i);
            if (endCIndex != -1) {
                comment = str.substr(startCIndex + 2, endCIndex - (startCIndex + 2)).split("\n").map(
                    function (str) {
                        return str.replace(/^\s*\*\s?/, "")
                    }).join("\n");
                i = endCIndex + 1;
                //console.log(str.substr(startCIndex, endCIndex - startCIndex));
                //console.log(comment);
                var sym = parseTags({comment:comment, start:startCIndex, end:endCIndex + 2}, str, filepath, context);
                symbols.push(sym);
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


