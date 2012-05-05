(function () {
    "use strict";
    var util = require("./../util.js");

    var TAG_REGEXP = /@(\w+)/;
    var TAG_REGEXP_ONE = /@\w+\s([^\s]*)/;
    var TAG_REGEXP_DESCRIPTION = /@\w+(.*)/;
    var TAG_REGEXP_AS = /@\w+\s([^\s]*)\s+as\s+([^\s]*)/;
    var TAG_REGEXP_PARAM = /@\w+\s(\{[^\}]*\})?\s*?(\[[^\]]*\])\s/;
    var TAG_REGEXP_RETURNS = /@\w+\s(\{(?:\w+(?:\.\w+)*|\*)(?:\|?(?:\w+(?:\.\w+)*|\*))*\})?/;

    var tags = {};

    var exportTags = exports.tags = {};

    /**
     * Parses types from a comment fragment.
     *
     * @example
     *
     * var types = coddoc.tags.parseTypes("{Type1|Boolean|String} rest of the comment");
     * //types => {comment : "res of the comment" types : ["Type1", "Boolean", "String"]};
     *
     * @memberOf coddoc.tags
     * @param {String} comment the comment fragment to parse.
     * @return {Object} an object containing :
     * <ul>
     *    <li>comment : the the comment fragment with the types removed</li>
     *    <li>tags : array of strings with the type names</li>
     * </ul>
     */
    exportTags.parseTypes = function(comment){
        var typeArr  = [];
        if (comment[0] === "{") {
            var types = util.getTokensBetween(comment, "{").join("");
            comment = comment.replace("{" + types + "}", "").trim();
            typeArr = types.split("|").map(function (t) {
                return t.trim();
            });
        }
        return {comment : comment, types : typeArr};
    };

    /**
     * Parses an individual name from a comment fragment.
     *
     * @example
     *
     * var name = coddoc.tags.parseName("someValue description");
     * //name => {comment : description, name : {name : "someValue", optional : false, defaultValue : undefined}};
     *
     * var name = coddoc.tags.parseName("[someValue] description");
     * //name => {comment : description, name : {name : "someValue", optional : true, defaultValue : undefined}};
     *
     * var name = coddoc.tags.parseName("[someValue=true] description");
     * //name => {comment : description, name : {name : "someValue", optional : true, defaultValue : true}};
     *
     * @memberof coddoc.tags
     * @param {String} comment the comment fragment to parse
     * @return {Object} an object containing:
     * <ul>
     *     <li>comment : the comment fragement with the name removed</li>
     *     <li>name
     *          <ul>
     *              <li>name : the name</li>
     *              <li>optional : boolean indicating if it is optional</li>
     *              <li>defaultValue : undefined if there isnt one otherwise a string representation of the
     *              default value</li>
     *          </ul>
     *     </li>
     * </ul>
     */
    exportTags.parseName = function(comment){
        var optional = false, defaultValue, name;
        if (comment[0] === "[") {
            optional = true;
            var param = util.getTokensBetween(comment, "[").join("");
            comment = comment.replace("[" + param + "]", "").trim();
            if (param.indexOf("=") !== -1) {
                parts = param.split("=");
                name = parts[0];
                defaultValue = parts[1];
            } else {
                name = param;
            }
        } else {
            var parts = comment.split(/\s/);
            name = parts.shift();
            comment = parts.join(" ").trim();
        }
        return {comment : comment, name : {name : name, optional : optional, defaultValue : defaultValue}};
    };

    var parseTypes = exportTags.parseTypes;
    var parseName = exportTags.parseName;
    var parseConstructorName = function (memberof, symbol) {
        var name = util.splitName(memberof.replace(".prototype", ""));
        symbol.name = name.name;
        symbol.memberof = name.memberof;
    };

    /**
     * Returns a regular expression that can be used to parse tags
     *
     * @protected
     * @memberOf coddoc
     *
     * @return {RegExp} a regular expression to parse valid tags.
     */
    exports.getTagRegexp = function () {
        return new RegExp("@(" + Object.keys(tags).join("|") + ")");
    };

    /**
     * Parses a tag and the coresponding comment using a matching tag handler. Each parsed tag
     * could add a new property to the {@link coddoc.Symbol}. The parsed tag will be added the the
     * {@link coddoc.Symbol#tags} array.
     *
     * @example
     *
     * coddoc.parseTag("someTag", "@someTag props...", sym, src, index, context);
     * //would add a new tag to the symbols property
     * {
     *      tag : "tagname",
     *      props : {...}
     * }
     *
     * //the props value would also be added to the symbols params array.
     *
     * @protected
     * @memberOf coddoc
     * @param {String} tag the tag name being parsed from the comment
     * @param {String} comment the comment fragment being parsed
     * @param {coddoc.Symbol} sym the symbol that the comment corresponds to. The code object and values
     * will have already been set.
     * @param {coddoc.Context} context the currect context object. The context allows tags to set new scopes and namespaces.
     */
    exports.parseTag = function (comment, sym, context) {
        var tag = comment.match(TAG_REGEXP), ret = {};
        if (tag && tag.length === 2) {
            var t = tags[tag[1]];
            if (t) {
                t.parse(comment, sym, context);
            } else {
                throw new Error("Invalid tag " + tag);
            }
        }
    };

    /**
     * Adds a new tag to be parsed. You can use this to add custom tags. {@link coddoc} will
     * not do anything with the new tag by default, however you can add functionality to handle the
     * new tag in the template.
     *
     * @example
     *
     * //if a tag is contains a '|' character then each variation will resolve the the same parser function.
     * coddoc.addTagHandler("void|VOID|Void", function(comment, symbol, context){
     *    //do something with the tag or add properties to the symbol.
     *    symbol.isVoid = true;
     *    symbol.tags.push({tag : "void", props : {}});
     * });
     * //in the template you can add functionality to handle the new tag. For example:
     * //in the html symbol.tmpl you could add a new label to the name header
     * <h3>
     * {{name}}
     * {{#if isStatic}}
     * <span class="label label-info">Static</span>
     * {{/if}}
     * {{#if isFunction}}
     * <span class="label label-label">Function</span>
     * {{/if}}
     * {{#if isPrivate}}
     * <span class="label label-important">Private</span>
     * {{else}}
     *      {{#if isProtected}}
     * <span class="label label-warning">Protected</span>
     *      {{else}}
     * <span class="label label-success">Public</span>
     *      {{/if}}
     * {{/if}}
     * {{#if isVoid}}
     * <span class="label label-label">Void</span>
     * {{/if}}
     * </h3>
     *
     * @memberOf coddoc
     * @param {String} tag the tag to parse, if a tag is contains a '|' character then the string will be split
     * and each variation will resolve to the same parse function. If the tag already exists then the old implementation
     * will be replaced by the new one.
     *
     * @param {Function} parse a parser function to invoke when a tag that matches the name is encountered.
     */
    var addTagHandler = function (tag, parse) {
        tag.split("|").forEach(function (tag) {
            tags[tag] = {
                parse:parse || function () {
                    return {tag:tag, props:{}};
                }};
        });
    };

    exports.addTagHandler = addTagHandler;


    addTagHandler("augments|extends", function (comment, symbol) {
        var t = "augments";
        var augmented = comment.match(TAG_REGEXP_ONE);
        if (augmented) {
            augmented = augmented[1];
        }
        var props = {augments:augmented.trim()};
        symbol.augments.push(props);
        symbol.tags.push({tag:t, props:props});
    });

    addTagHandler("lends", function (comment, symbol, context) {
        var t = "lends";
        var lends = comment.match(TAG_REGEXP_ONE);
        if (lends) {
            lends = util.resolveName(lends[1]);
            context.activateScope(lends);
        }
        symbol.lends = lends;
        symbol.tags.push({tag:t, props:{lends:lends.trim()}});
    });

    addTagHandler("namespace", function (comment, symbol, context) {
        var t = "namespace";
        var descr = comment.replace(/@(namespace)\s*/, "").trim();
        symbol.isNamespace = true;
        symbol.description = (symbol.description || "") + descr;
        symbol.tags.push({tag:t, props:{description:descr}});
    });

    addTagHandler("param|parameter|arg|argument", function (comment, symbol, context) {
        var t = "param", props = {};
        comment = comment.replace(/@(param(eter)?|arg(ument)?)\s*/, "").trim();
        var types = parseTypes(comment);
        props.types = types.types;
        comment = types.comment;
        var name = parseName(comment);
        props.name = name.name;
        comment = name.comment;
        props.description = comment.trim();
        var currParam = symbol.params.filter(function (p) {
            return p.name.name === props.name.name;
        });
        if (currParam.length) {
            currParam = currParam[0];
            currParam.name = props.name;
            currParam.description = props.description;
        } else {
            symbol.params.push(props);
        }
        symbol.tags.push({tag:t, props:props});
    });

    addTagHandler("return|returns", function (comment, symbol, context) {
        var t = "returns", props = {};
        comment = comment.replace(/@(return(s)?)\s*/, "").trim();
        var types = parseTypes(comment);
        props.types = types.types;
        comment = types.comment;
        props.description = comment;
        symbol.returns.push(props);
        symbol.tags.push({tag:t, props:props});
    });

    addTagHandler("memberof|memberOf", function (comment, symbol, context) {
        var t = "memberof";
        var descr = comment.replace(/@(member[O|o]f?)\s*/, "").trim();
        if (descr) {
            descr = util.resolveName(descr.trim());
        }
        symbol.memberof = descr;
        symbol.tags.push({tag:t, props:{of:descr}});
    });


    addTagHandler("name", function (comment, symbol, context) {
        var t = "name";
        var name = comment.replace(/@name\s*/, "").trim();
        symbol.name = name;
        symbol.tags.push({tag:t, props:{name:name}});
    });


    addTagHandler("constructor|constructs",
        function (comment, symbol) {
            var memberof = symbol.memberof;
            if (memberof.match(".prototype")) {
                parseConstructorName(memberof, symbol);
            }
            symbol.isConstructor = true;
            symbol.tags.push({tag:"constructor", props:{}});
        });

    addTagHandler("class|classdesc", function (comment, symbol) {
        var t = "class";
        var descr = comment.replace(/@class(desc)?\s*/, "").trim();
        var memberof = symbol.memberof || "";
        if (memberof.match(".prototype")) {
            parseConstructorName(memberof, symbol);
        }
        symbol.isConstructor = true;
        symbol.description += descr;
        symbol.tags.push({tag:t, props:{description:descr}});
    });

    addTagHandler("example", function (comment, symbol) {
        var props = {code:comment.replace(/@example\s*/, "").trim()};
        symbol.examples.push(props);
        symbol.tags.push({tag:"example", props:props});
    });

    addTagHandler("see",
        function (comment, symbol) {
            var props = {description:comment.replace(/@see\s*/, "").trim()};
            symbol.see.push(props);
            symbol.tags.push({tag:"see", props:props});
        });


    addTagHandler("private", function (comment, symbol) {
        symbol.isPrivate = true;
        symbol.tags.push({tag:"private", props:{}});
    });

    addTagHandler("protected", function (comment, symbol) {
        symbol.isPrivate = false;
        symbol.isProtected = true;
        symbol.tags.push({tag:"protected", props:{}});
    });

    addTagHandler("public", function (comment, symbol) {
        symbol.isPrivate = false;
        symbol.isPublic = true;
        symbol.tags.push({tag:"public", props:{}});
    });

    addTagHandler("ignore", function (comment, symbol) {
        symbol.ignore = true;
        symbol.tags.push({tag:"ignore", props:{}});
    });

    addTagHandler("ignoreCode", function (comment, symbol) {
        symbol.ignoreCode = true;
        symbol.code = null;
        symbol.tags.push({tag:"ignoreCode", props:{}});
    });

    addTagHandler("method|function", function (comment, symbol) {
        symbol.isFunction = true;
        symbol.tags.push({tag:"method", props:{}});
    });

    addTagHandler("field", function (comment, symbol) {
        symbol.isFunction = false;
        symbol.tags.push({tag:"field", props:{}});
    });

    addTagHandler("type", function (comment, symbol) {
        var props = {type:comment.replace(/@type\s*/, "").trim()};
        symbol.type = props.type;
        symbol.tags.push({tag:"type", props:props});
    });


    addTagHandler("default", function (comment, symbol) {
        var props = {defaultValue:comment.replace(/@default\s*/, "")};
        symbol.code = props.defaultValue;
        symbol.tags.push({tag:"default", props:props});
    });

    addTagHandler("throws|throw|exception", function (comment, symbol) {
        var t = "throws", props = {};
        comment = comment.replace(/@(throw(s)?|exception)?\s*/, "").trim();
        var types = parseTypes(comment);
        props.types = types.types;
        comment = types.comment;
        props.description = comment;
        symbol.throws.push(props);
        symbol.tags.push({tag:t, props:props});
    });


    addTagHandler("property", function (comment, symbol) {
        var t = "property", props = {};
        comment = comment.replace(/@(property)\s*/, "").trim();
        var types = parseTypes(comment);
        props.types = types.types;
        comment = types.comment;
        var name = parseName(comment);
        props.name = name.name;
        comment = name.comment;
        props.description = comment.trim();
        symbol.properties.push({name:props.name.name, type : types.types, code:props.name.defaultValue, description:props.description, isStatic:false});
        symbol.tags.push({tag:t, props:props});
    });

    addTagHandler("borrows", function (comment, symbol) {
        var tag = "borrows", props = {};
        comment = comment.replace(/@(borrows)\s*/, "");
        var parts = comment.split(/\s*as\s*/).map(function (p) {
            return p.trim();
        });
        if (parts) {
            var as = parts[1];
            props.borrows = util.splitName(util.resolveName(parts[0]));
            props.as = as.replace("#", "").replace(/^\./, "");
            props.isStatic = as.indexOf("#") === -1;
        }
        symbol.borrows.push(props);
        symbol.tags.push({tag:tag, props:props});
    });

    addTagHandler("constant|const", function (comment, symbol) {
        symbol.isConstant = true;
        symbol.tags.push({tag:"constant", props:{}});
    });

    addTagHandler("desc|description", function (comment, symbol) {
        var t = "description", description = comment.replace(/@desc(ription)*\s*/, "").trim();
        symbol.description = (symbol.description || "") + description;
        symbol.tags.push({tag:"description", props:{description:description}});
    });

    addTagHandler("projectName", function (comment, symbol) {
        var t = "projectName", description = comment.replace(/@projectName*\s*/, "").trim();
        symbol.isProjectName = true;
        symbol.projectName = (symbol.projectName || "") + description;
        symbol.tags.push({tag:t, props:{description:description}});
    });

    addTagHandler("header", function (comment, symbol) {
        var t = "header", description = comment.replace(/@header*\s*/, "").trim();
        symbol.isHeader = true;
        symbol.header = (symbol.header || "") + description;
        symbol.tags.push({tag:t, props:{description:description}});
    });

    addTagHandler("footer", function (comment, symbol) {
        var t = "footer", description = comment.replace(/@footer*\s*/, "").trim();
        symbol.isFooter = true;
        symbol.footer = (symbol.footer || "") + description;
        symbol.tags.push({tag:t, props:{description:description}});
    });


    /*addTagHandler("copyright", function (comment, symbol, context) {
     throw new Error("not implemented");
     });


     addTagHandler("deprecated", function (comment, symbol, context) {
     throw new Error("not implemented");
     });


     addTagHandler("enum", function (comment, symbol, context) {
     throw new Error("not implemented");
     });

     addTagHandler("event", function (comment, symbol, context) {
     throw new Error("not implemented");
     });

     addTagHandler("exports", function (comment, symbol, context) {
     throw new Error("not implemented");
     });

     addTagHandler("file|overview|fileoverview|fileOverview", function (comment, symbol, context) {
     throw new Error("not implemented");
     });

     addTagHandler("fires", function (comment, symbol, context) {
     throw new Error("not implemented");
     });

     addTagHandler("global", function (comment, symbol, context) {
     throw new Error("not implemented");
     });


     addTagHandler("inner", function (comment, symbol, context) {
     throw new Error("not implemented");
     });

     addTagHandler("instance", function (comment, symbol, context) {
     throw new Error("not implemented");
     });

     addTagHandler("kind", function (comment, symbol, context) {
     throw new Error("not implemented");
     });

     addTagHandler("license", function (comment, symbol, context) {
     throw new Error("not implemented");
     });

     addTagHandler("member", function (comment, symbol, context) {
     throw new Error("not implemented");
     });
     addTagHandler("var", function (comment, symbol, context) {
     return this.member(comment)
     });

     addTagHandler("mixes", function (comment, symbol, context) {
     throw new Error("not implemented");
     });

     addTagHandler("mixin", function (comment, symbol, context) {
     throw new Error("not implemented");
     });

     addTagHandler("module", function (comment, symbol, context) {
     throw new Error("not implemented");
     });

     addTagHandler("readonly", function (comment, symbol, context) {
     throw new Error("not implemented");
     });

     addTagHandler("requires", function (comment, symbol, context) {
     throw new Error("not implemented");
     });

     addTagHandler("since", function (comment, symbol, context) {
     throw new Error("not implemented");
     });

     addTagHandler("summary", function (comment, symbol, context) {
     throw new Error("not implemented");
     });

     addTagHandler("this", function (comment, symbol, context) {
     throw new Error("not implemented");
     });

     addTagHandler("todo", function (comment, symbol, context) {
     throw new Error("not implemented");
     });


     addTagHandler("typedef", function (comment, symbol, context) {
     throw new Error("not implemented");
     });

     addTagHandler("version", function (comment, symbol, context) {
     throw new Error("not implemented");
     });
     */

}());
