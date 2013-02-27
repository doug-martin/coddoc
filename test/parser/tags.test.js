"use strict";
var it = require("it"),
    assert = require("assert"),
    coddoc = require("../../lib/index.js"),
    Symbol = require("../../lib/symbol.js"),
    Context = require("../../lib/context.js"),
    tags = require("../../lib/parser/tags.js");

it.describe("coddoc/parser/tags.js", function (it) {
    var context, symbol;
    it.beforeEach(function () {
        context = new Context();
        symbol = new Symbol();
    });

    it.should("expose the tags functions", function () {
        assert.isFunction(coddoc.parseTag);
        assert.isFunction(coddoc.addTagHandler);
        assert.isFunction(coddoc.tags.parseTypes);
        assert.isFunction(coddoc.tags.parseName);
    });

    it.should("create a tagRegexp", function () {
        assert.deepEqual(tags.getTagRegexp().toString(),
            "/@(augments|extends|lends|namespace|param|parameter|arg|argument|return|returns|memberof|memberOf" +
                "|name|constructor|constructs|class|classdesc|example|see|private|protected|static|public|ignore|ignoreCode" +
                "|method|function|field|type|default|throws|throw|exception|property|borrows|constant|const|desc" +
                "|description|projectName|header|footer|github|includeDoc)/");
    });

    var parseTag = function (comment) {
        return tags.parseTag(comment, symbol, context);
    };

    it.describe("#parseTag", function (it) {

        it.should("parse augments", function () {
            parseTag("@augments coddoc.Test");
            assert.deepEqual(symbol.augments, [
                {augments: "coddoc.Test"}
            ]);
            assert.deepEqual(symbol.tags, [
                {tag: "augments", props: {augments: "coddoc.Test"}}
            ]);
        });

        it.should("parse extends", function () {
            parseTag("@extends coddoc.Test");
            assert.deepEqual(symbol.augments, [
                {augments: "coddoc.Test"}
            ]);
            assert.deepEqual(symbol.tags, [
                {tag: "augments", props: {augments: "coddoc.Test"}}
            ]);
        });

        it.should("parse lends", function () {
            parseTag("@lends test.Test.prototype");
            assert.equal(symbol.lends, "test.Test.prototype");
            assert.deepEqual(symbol.tags, [
                {tag: "lends", props: {lends: "test.Test.prototype"}}
            ]);
            assert.equal(context.getActiveScopeName(), "test.Test.prototype");
        });

        it.should("parse lends with name paths", function () {
            parseTag("@lends test.Test#");
            assert.equal(symbol.lends, "test.Test.prototype");
            assert.deepEqual(symbol.tags, [
                {tag: "lends", props: {lends: "test.Test.prototype"}}
            ]);
            assert.equal(context.getActiveScopeName(), "test.Test.prototype");
        });

        it.should("parse namespace", function () {
            parseTag("@namespace This is some namespace!!!!");
            assert.isTrue(symbol.isNamespace);
            assert.equal(symbol.description, "This is some namespace!!!!");
            assert.deepEqual(symbol.tags, [
                {tag: "namespace", props: {description: "This is some namespace!!!!"}}
            ]);
        });
        ["param", "parameter", "arg", "argument"].forEach(function (type) {
            it.should("parse " + type, function () {
                parseTag("@" + type + " someName some name description");
                assert.deepEqual(symbol.params, [
                    {types: [], name: {name: "someName", optional: false, defaultValue: undefined}, description: "some name description"}
                ]);
                assert.deepEqual(symbol.tags, [
                    {tag: "param", props: {types: [], name: {name: "someName", optional: false, defaultValue: undefined}, description: "some name description"}}
                ]);
            });
            it.should("parse " + type + " with types", function () {
                parseTag("@" + type + " {Boolean|String} someName some name description");
                assert.deepEqual(symbol.params, [
                    {types: ["Boolean", "String"], name: {name: "someName", optional: false, defaultValue: undefined}, description: "some name description"}
                ]);
                assert.deepEqual(symbol.tags, [
                    {tag: "param", props: {types: ["Boolean", "String"], name: {name: "someName", optional: false, defaultValue: undefined}, description: "some name description"}}
                ]);
            });

            it.should("parse " + type + " as optional without value", function () {
                parseTag("@" + type + " [someName] some name description");
                assert.deepEqual(symbol.params, [
                    {types: [], name: {name: "someName", optional: true, defaultValue: undefined}, description: "some name description"}
                ]);
                assert.deepEqual(symbol.tags, [
                    {tag: "param", props: {types: [], name: {name: "someName", optional: true, defaultValue: undefined}, description: "some name description"}}
                ]);
            });

            it.should("parse " + type + " as optional with value", function () {
                parseTag("@" + type + " [someName=true] some name description");
                assert.deepEqual(symbol.params, [
                    {types: [], name: {name: "someName", optional: true, defaultValue: "true"}, description: "some name description"}
                ]);
                assert.deepEqual(symbol.tags, [
                    {tag: "param", props: {types: [], name: {name: "someName", optional: true, defaultValue: "true"}, description: "some name description"}}
                ]);
            });

            it.should("parse " + type + " with types as optional without value", function () {
                parseTag("@" + type + " {Boolean|String} [someName] some name description");
                assert.deepEqual(symbol.params, [
                    {types: ["Boolean", "String"], name: {name: "someName", optional: true, defaultValue: undefined}, description: "some name description"}
                ]);
                assert.deepEqual(symbol.tags, [
                    {tag: "param", props: {types: ["Boolean", "String"], name: {name: "someName", optional: true, defaultValue: undefined}, description: "some name description"}}
                ]);
            });

            it.should("parse " + type + " with types as optional with value", function () {
                parseTag("@" + type + " {Boolean|String} [someName=true] some name description");
                assert.deepEqual(symbol.params, [
                    {types: ["Boolean", "String"], name: {name: "someName", optional: true, defaultValue: "true"}, description: "some name description"}
                ]);
                assert.deepEqual(symbol.tags, [
                    {tag: "param", props: {types: ["Boolean", "String"], name: {name: "someName", optional: true, defaultValue: "true"}, description: "some name description"}}
                ]);
            });
        });

        ["return", "returns"].forEach(function (type) {
            it.should("parse " + type, function () {
                parseTag("@" + type + " some description");
                assert.deepEqual(symbol.returns, [
                    {types: [], description: "some description"}
                ]);
                assert.deepEqual(symbol.tags, [
                    {tag: "returns", props: {types: [], description: "some description"}}
                ]);
            });
            it.should("parse " + type + " with types", function () {
                parseTag("@" + type + " {Boolean|String} some description");
                assert.deepEqual(symbol.returns, [
                    {types: ["Boolean", "String"], description: "some description"}
                ]);
                assert.deepEqual(symbol.tags, [
                    {tag: "returns", props: {types: ["Boolean", "String"], description: "some description"}}
                ]);
            });
        });

        ["memberof", "memberOf"].forEach(function (type) {
            it.should("parse " + type, function () {
                parseTag("@" + type + " test.Test");
                assert.deepEqual(symbol.memberof, "test.Test");
                assert.deepEqual(symbol.tags, [
                    {tag: "memberof", props: {of: "test.Test"}}
                ]);
            });

            it.should("parse " + type + " with name path", function () {
                parseTag("@" + type + " test.Test#");
                assert.deepEqual(symbol.memberof, "test.Test.prototype");
                assert.deepEqual(symbol.tags, [
                    {tag: "memberof", props: {of: "test.Test.prototype"}}
                ]);
            });
        });

        it.should("parse name", function () {
            parseTag("@name SomeName");
            assert.deepEqual(symbol.name, "SomeName");
            assert.deepEqual(symbol.tags, [
                {tag: "name", props: {name: "SomeName"}}
            ]);
        });

        ["constructor", "constructs"].forEach(function (type) {

            it.should("parse " + type, function () {
                parseTag("@" + type);
                assert.isTrue(symbol.isConstructor);
                assert.equal(symbol.name, "");
                assert.equal(symbol.memberof, "");
            });

            it.should("parse " + type + " and resolve name and memberof", function () {
                symbol.name = "constructor";
                symbol.memberof = "some.ObjectType.prototype";
                parseTag("@" + type);
                assert.isTrue(symbol.isConstructor);
                assert.equal(symbol.name, "ObjectType");
                assert.equal(symbol.memberof, "some");
            });

        });

        ["class", "classdesc"].forEach(function (type) {

            it.should("parse " + type, function () {
                parseTag("@" + type + " some description of class");
                assert.isTrue(symbol.isConstructor);
                assert.equal(symbol.description, "some description of class");
                assert.equal(symbol.name, "");
                assert.equal(symbol.memberof, "");
            });

            it.should("parse " + type + " and resolve name and memberof", function () {
                symbol.name = "constructor";
                symbol.memberof = "some.ObjectType.prototype";
                parseTag("@" + type + " some description of class");
                assert.isTrue(symbol.isConstructor);
                assert.equal(symbol.description, "some description of class");
                assert.equal(symbol.name, "ObjectType");
                assert.equal(symbol.memberof, "some");
            });
        });

        it.should("parse example", function () {
            parseTag("@example \n var test = 'Test';\n test.match(/test/ig);\n");
            assert.deepEqual(symbol.examples, [
                {code: "var test = 'Test';\n test.match(/test/ig);"}
            ]);

            assert.deepEqual(symbol.tags, [
                {tag: "example", props: {code: "var test = 'Test';\n test.match(/test/ig);"}}
            ]);
        });

        ["private", "protected", "public"].forEach(function (type) {
            it.should("parse " + type, function () {
                parseTag("@" + type);
                var prop = "is" + type.charAt(0).toUpperCase() + type.substr(1);
                assert.isTrue(symbol[prop]);
                assert.deepEqual(symbol.tags, [
                    {tag: type, props: {}}
                ]);
            });
        });

        ["ignore", "ignoreCode"].forEach(function (type) {
            it.should("parse " + type, function () {
                assert.isFalse(symbol[type]);
                parseTag("@" + type);
                assert.isTrue(symbol[type]);
                assert.deepEqual(symbol.tags, [
                    {tag: type, props: {}}
                ]);
            });
        });

        ["method", "function"].forEach(function (type) {

            it.should("parse " + type, function () {
                assert.isFalse(symbol.isFunction);
                parseTag("@" + type);
                assert.isTrue(symbol.isFunction);
                assert.deepEqual(symbol.tags, [
                    {tag: "method", props: {}}
                ]);
            });

        });

        it.should("parse field", function () {
            assert.isFalse(symbol.isFunction);
            parseTag("@field");
            assert.isFalse(symbol.isFunction);
            assert.deepEqual(symbol.tags, [
                {tag: "field", props: {}}
            ]);
        });

        it.should("parse type", function () {
            parseTag("@type Boolean");
            assert.equal(symbol.type, "Boolean");
            assert.deepEqual(symbol.tags, [
                {tag: "type", props: {type: "Boolean"}}
            ]);
        });

        it.should("parse default", function () {
            parseTag("@default 'Some Default Value!'");
            assert.equal(symbol.code, "'Some Default Value!'");
            assert.deepEqual(symbol.tags, [
                {tag: "default", props: {defaultValue: "'Some Default Value!'"}}
            ]);
        });
        ["throw", "throws", "exception"].forEach(function (type) {
            it.should("parse " + type, function () {
                parseTag("@" + type + " description of exception");
                var props = {types: [], description: "description of exception"};
                assert.deepEqual(symbol.throws, [props]);
                assert.deepEqual(symbol.tags, [
                    {tag: "throws", props: props}
                ]);
            });

            it.should("parse " + type + " with a type", function () {
                parseTag("@" + type + " {Error} description of exception");
                var props = {types: ["Error"], description: "description of exception"};
                assert.deepEqual(symbol.throws, [props]);
                assert.deepEqual(symbol.tags, [
                    {tag: "throws", props: props}
                ]);
            });

            it.should("parse " + type + " with multiple types", function () {
                parseTag("@" + type + " {Error|CustomError} description of exception");
                var props = {types: ["Error", "CustomError"], description: "description of exception"};
                assert.deepEqual(symbol.throws, [props]);
                assert.deepEqual(symbol.tags, [
                    {tag: "throws", props: props}
                ]);
            });
        });

        it.should("parse property", function () {
            parseTag("@property someName some name description");
            assert.deepEqual(symbol.properties, [
                {type: [], name: "someName", code: undefined, isStatic: false, description: "some name description"}
            ]);
            assert.deepEqual(symbol.tags, [
                {tag: "property", props: {types: [], name: {name: "someName", optional: false, defaultValue: undefined}, description: "some name description"}}
            ]);
        });
        it.should("parse property with types", function () {
            parseTag("@property {Boolean|String} someName some name description");
            assert.deepEqual(symbol.properties, [
                {type: ["Boolean", "String"], name: "someName", code: undefined, isStatic: false, description: "some name description"}
            ]);
            assert.deepEqual(symbol.tags, [
                {tag: "property", props: {types: ["Boolean", "String"], name: {name: "someName", optional: false, defaultValue: undefined}, description: "some name description"}}
            ]);
        });

        it.should("parse property as optional without value", function () {
            parseTag("@property [someName] some name description");
            assert.deepEqual(symbol.properties, [
                {type: [], name: "someName", code: undefined, isStatic: false, description: "some name description"}
            ]);
            assert.deepEqual(symbol.tags, [
                {tag: "property", props: {types: [], name: {name: "someName", optional: true, defaultValue: undefined}, description: "some name description"}}
            ]);
        });

        it.should("parse property as optional with value", function () {
            parseTag("@property [someName=true] some name description");
            assert.deepEqual(symbol.properties, [
                {type: [], name: "someName", code: "true", isStatic: false, description: "some name description"}
            ]);
            assert.deepEqual(symbol.tags, [
                {tag: "property", props: {types: [], name: {name: "someName", optional: true, defaultValue: "true"}, description: "some name description"}}
            ]);
        });

        it.should("parse property with types as optional without value", function () {
            parseTag("@property {Boolean|String} [someName] some name description");
            assert.deepEqual(symbol.properties, [
                {type: ["Boolean", "String"], name: "someName", code: undefined, isStatic: false, description: "some name description"}
            ]);
            assert.deepEqual(symbol.tags, [
                {tag: "property", props: {types: ["Boolean", "String"], name: {name: "someName", optional: true, defaultValue: undefined}, description: "some name description"}}
            ]);
        });

        it.should("parse property with types as optional with value", function () {
            parseTag("@property {Boolean|String} [someName=true] some name description");
            assert.deepEqual(symbol.properties, [
                {type: ["Boolean", "String"], name: "someName", code: "true", isStatic: false, description: "some name description"}
            ]);
            assert.deepEqual(symbol.tags, [
                {tag: "property", props: {types: ["Boolean", "String"], name: {name: "someName", optional: true, defaultValue: "true"}, description: "some name description"}}
            ]);
        });

        it.should("parse borrows", function () {
            parseTag("@borrows test.func as func");
            var props = {borrows: {memberof: "test", name: "func"}, as: "func", isStatic: true};
            assert.deepEqual(symbol.borrows, [props]);
            assert.deepEqual(symbol.tags, [
                {tag: "borrows", props: props}
            ]);
        });

        it.should("parse borrows with '.' namepath", function () {
            parseTag("@borrows test.func as .func");
            var props = {borrows: {memberof: "test", name: "func"}, as: "func", isStatic: true};
            assert.deepEqual(symbol.borrows, [props]);
            assert.deepEqual(symbol.tags, [
                {tag: "borrows", props: props}
            ]);
        });

        it.should("parse borrows with '#' namepath", function () {
            parseTag("@borrows test.func as #func");
            var props = {borrows: {memberof: "test", name: "func"}, as: "func", isStatic: false};
            assert.deepEqual(symbol.borrows, [props]);
            assert.deepEqual(symbol.tags, [
                {tag: "borrows", props: props}
            ]);
        });

        ["const", "constant"].forEach(function (type) {

            it.should("parse " + type, function () {
                assert.isFalse(symbol.isConstant);
                parseTag("@" + type);
                assert.isTrue(symbol.isConstant);
                assert.deepEqual(symbol.tags, [
                    {tag: "constant", props: {}}
                ]);
            });

        });

        ["desc", "description"].forEach(function (type) {

            it.should("parse " + type, function () {
                assert.equal(symbol.description, "");
                parseTag("@" + type + " some test description");
                assert.deepEqual(symbol.tags, [
                    {tag: "description", props: {description: "some test description"}}
                ]);
            });

        });

        it.should("parse projectName", function () {
            parseTag("@projectName testProject");
            assert.isTrue(symbol.isProjectName);
            assert.equal(symbol.projectName, "testProject");
            assert.deepEqual(symbol.tags, [
                {tag: "projectName", props: {description: "testProject"}}
            ]);
        });

        it.describe("@header", function (it) {

            it.should("with description", function () {
                parseTag("@header \n[this] is a project\ndescription");
                assert.isTrue(symbol.isHeader);
                assert.equal(symbol.header.content, "[this] is a project\ndescription");
                assert.deepEqual(symbol.tags, [
                    {tag: "header", props: {content: "[this] is a project\ndescription"}}
                ]);
            });

            it.should("header with location", function () {
                parseTag("@header [../myFile.md]");
                assert.isTrue(symbol.isHeader);
                assert.equal(symbol.header.location, "../myFile.md");
                assert.deepEqual(symbol.tags, [
                    {tag: "header", props: {location: "../myFile.md", file: symbol.file}}
                ]);
            });
        });

        it.describe("@footer", function (it) {

            it.should("with description", function () {
                parseTag("@footer \n[this] is a project\nfooter");
                assert.isTrue(symbol.isFooter);
                assert.equal(symbol.footer.content, "[this] is a project\nfooter");
                assert.deepEqual(symbol.tags, [
                    {tag: "footer", props: {content: "[this] is a project\nfooter"}}
                ]);
            });

            it.should("header with location", function () {
                parseTag("@footer [../myFile.md]");
                assert.isTrue(symbol.isFooter);
                assert.equal(symbol.footer.location, "../myFile.md");
                assert.deepEqual(symbol.tags, [
                    {tag: "footer", props: {location: "../myFile.md", file: symbol.file}}
                ]);
            });
        });
    });

    it.describe("#addTagHandler", function (it) {
        var types = ["void", "VOID", "Void"];
        it.beforeAll(function () {
            tags.addTagHandler(types.join("|"), function (comment, symbol, context) {
                //do something with the tag or add properties to the symbol.
                symbol.isVoid = true;
                symbol.tags.push({tag: "void", props: {}});
            });
        });
        it.should("add it to the tagRegExp", function () {
            assert.deepEqual(tags.getTagRegexp().toString(),
                "/@(augments|extends|lends|namespace|param|parameter|arg|argument|return|returns|memberof|memberOf" +
                    "|name|constructor|constructs|class|classdesc|example|see|private|protected|static|public|ignore|ignoreCode" +
                    "|method|function|field|type|default|throws|throw|exception|property|borrows|constant|const|desc" +
                    "|description|projectName|header|footer|github|includeDoc|void|VOID|Void)/");
        });
        types.forEach(function (type) {
            it.should("parse the " + type + " added tag", function () {
                parseTag("@" + type);
                assert.isTrue(symbol.isVoid);
                assert.deepEqual(symbol.tags, [
                    {tag: "void", props: {}}
                ]);
            });
        });

    });
});

it.run();



