(function () {
    "use strict";
    var it = require("it"),
        fs = require("fs"),
        path = require("path"),
        assert = require("assert"),
        Symbol = require("../../lib/symbol.js"),
        Context = require("../../lib/context.js"),
        coddoc = require("../../lib/index.js"),
        code = require("../../lib/parser/code.js");

    it.describe("coddoc/parser/tags.js", function (it) {

        var context, symbol;
        it.beforeEach(function () {
            context = new Context();
            symbol = new Symbol();
        });

        var parseCode = function (src) {
            code.parseCode(src, symbol, context);
        };

        it.describe("matching /^function (\\w+) *\\{/", function (it) {

            var code = 'function strFunc(str) {\n    return str;}';

            it.should("set isFunction to true", function () {
                parseCode(code);
                assert.isTrue(symbol.isFunction);
            });

            it.should("parse code", function () {
                parseCode(code);
                assert.equal(symbol.code, "function (str){\n   return str;\n}");
            });

            it.should("parse name", function () {
                parseCode(code);
                assert.equal(symbol.name, "strFunc");
            });

            it.should("set isConstructor to false", function(){
                parseCode(code);
                assert.isFalse(symbol.isConstructor);
            });

            it.should("set isConstructor to true if name does not begin with capital", function(){
                var code = 'function StrFunc(str1, str2) {};';
                parseCode(code);
                assert.isTrue(symbol.isConstructor);
            });

            it.should("set isConstructor to false if whole name is all caps", function(){
                var code = 'function STR_FUNC(str1, str2) {};';
                parseCode(code);
                assert.isFalse(symbol.isConstructor);
            });

            it.should("parse params", function () {
                parseCode(code);
                assert.deepEqual(symbol.params, [
                    {name:{name:"str"}}
                ]);
            });

            it.should("set private if name starts with _", function () {
                var code = 'function _strFunc(str) {\n    return str;}';
                parseCode(code);
                assert.isTrue(symbol.isPrivate);
            });

        });

        it.describe("matching /^var *(\\w+) *= *function/", function (it) {

            var code = 'var MyObject = function (str1, str2) {};';

            it.should("set isFunction to true", function () {
                parseCode(code);
                assert.isTrue(symbol.isFunction);
            });

            it.should('parse code', function () {
                parseCode(code);
                assert.equal(symbol.code, "function (str1,str2){\n   \n}");
            });

            it.should('parse name', function () {
                parseCode(code);
                assert.equal(symbol.name, "MyObject");
            });

            it.should("set isConstructor to true", function(){
                parseCode(code);
                assert.isTrue(symbol.isConstructor);
            });

            it.should("set isConstructor to false if name does not begin with capital", function(){
                var code = 'var myObject = function (str1, str2) {};';
                parseCode(code);
                assert.isFalse(symbol.isConstructor);
            });

            it.should("set isConstructor to false if whole name is all caps", function(){
                var code = 'var MY_OBJECT = function (str1, str2) {};';
                parseCode(code);
                assert.isFalse(symbol.isConstructor);
            });

            it.should('parse params', function () {
                parseCode(code);
                assert.deepEqual(symbol.params, [
                    {name:{name:"str1"}},
                    {name:{name:"str2"}}
                ]);
            });

            it.should("set isPrivate to tue if name begins with _", function(){
                var code = 'var __MyObject = function () {};';
                parseCode(code);
                assert.isTrue(symbol.isPrivate);
            });
        });
        it.describe('matching /^(\\w+(?:\\.\\w+)+) *= *function/', function (it) {

            var code = 'MyObject.prototype.testFunction = function (str1, str2) {\n};';

            it.should('should set isFunction to true', function () {
                parseCode(code);
                assert.isTrue(symbol.isFunction);
            });

            it.should('parse name', function () {
                parseCode(code);
                assert.equal(symbol.name, "testFunction");
            });

            it.should('parse code', function () {
                parseCode(code);
                assert.equal(symbol.code, "function (str1,str2){\n   \n}");
            });

            it.should("set isConstructor to false", function(){
                parseCode(code);
                assert.isFalse(symbol.isConstructor);
            });

            it.should("set isConstructor if name begins with a capital letter", function(){
                var code = 'MyObject.prototype.TestFunction = function (str1, str2) {\n};';
                parseCode(code);
                assert.isTrue(symbol.isConstructor);
            });

            it.should("set isConstructor to false if whole name is all caps", function(){
                var code = 'MyObject.prototype.TEST_FUNCTION = function (str1, str2) {\n};';
                parseCode(code);
                assert.isFalse(symbol.isConstructor);
            });

            it.should('parse params', function () {
                parseCode(code);
                assert.deepEqual(symbol.params, [
                    {name:{name:"str1"}},
                    {name:{name:"str2"}}
                ]);
            });

            it.should("set isPrivate to tue if name begins with _", function(){
                var code = 'MyObject.prototype._testFunction = function () {\n};';
                parseCode(code);
                assert.isTrue(symbol.isPrivate);
            });

            it.should('parse memberof', function () {
                parseCode(code);
                assert.equal(symbol.memberof, "MyObject.prototype");
            });

            it.should('isStatic should be false for prototypes', function () {
                parseCode(code);
                assert.isFalse(symbol.isStatic);
            });

            it.should('isStatic should be true for non prototypes', function () {
                var code = 'MyObject.testFunction = function () {\n};';
                parseCode(code);
                assert.isTrue(symbol.isStatic);
            });
        });

        it.describe("matching /^(\\w+(?:\\.\\w+)+) *= *([^\\n;]+)/", function (it) {

            var code = 'MyObject.prototype.testProperty = "property";';
            it.should('set isFunction to false', function () {
                parseCode(code);
                assert.isFalse(symbol.isFunction);
            });

            it.should('parse code', function () {
                parseCode(code);
                assert.equal(symbol.code, '"property"');
            });

            it.should('parse name', function () {
                parseCode(code);
                assert.equal(symbol.name, "testProperty");
            });

            it.should('parse memberof', function () {
                parseCode(code);
                assert.equal(symbol.memberof, "MyObject.prototype");
            });

            it.should("set isPrivate to tue if name begins with _", function(){
                var code = 'MyObject.prototype._testProperty = "property";';
                parseCode(code);
                assert.isTrue(symbol.isPrivate);
            });

            it.should("set isStatic to false for prototype properties", function () {
                var code = 'MyObject.prototype.testProperty = "property";';
                parseCode(code);
                assert.isFalse(symbol.isStatic);
            });

            it.should("set isStatic to true for non prototype properties", function () {
                var code = 'MyObject.testProperty = "property";';
                parseCode(code);
                assert.isTrue(symbol.isStatic);
            });

            it.should('parse code with new lines', function () {
                var code = 'MyObject.testProperty = [\n\t"some", \n\t"property"\n];';
                parseCode(code);
                assert.equal(symbol.code, '[\n\t"some", \n\t"property"\n]');
            });

            it.should('parse properties that are objects', function () {
                var code = 'MyObject.testProperty = {\n\tx:"y"\n}';
                parseCode(code);
                assert.equal(symbol.code, '{\n\tx:"y"\n}');
            });

            it.should('parse properties that are arrays', function () {
                var code = 'MyObject.testProperty = [\n\t"some", \n\t"property"\n];';
                parseCode(code);
                assert.equal(symbol.code, '[\n\t"some", \n\t"property"\n]');
            });

        });

        it.describe("matching /^var +(\\w+) *= *([^\\n;]+)/", function (it) {

            var code = 'var testProperty = "property";';

            it.should('set isFunction to false', function () {
                parseCode(code);
                assert.isFalse(symbol.isFunction);
            });

            it.should('parse code', function () {
                parseCode(code);
                assert.equal(symbol.code, '"property"');
            });

            it.should('parse name', function () {
                parseCode(code);
                assert.equal(symbol.name, "testProperty");
            });

            it.should("set isPrivate to tue if name begins with _", function(){
                var code = 'var _testProperty = "property";';
                parseCode(code);
                assert.isTrue(symbol.isPrivate);
            });

            it.should('parse code with new lines', function () {
                var code = 'var testProperty = [\n\t"some", \n\t"property"\n];';
                parseCode(code);
                assert.equal(symbol.code, '[\n\t"some", \n\t"property"\n]');
            });

            it.should('parse properties that are objects', function () {
                var code = 'var testProperty = {\n\tx:"y"\n}';
                parseCode(code);
                assert.equal(symbol.code, '{\n\tx:"y"\n}');
            });

            it.should('parse properties that are arrays', function () {
                var code = 'var testProperty = [\n\t"some", \n\t"property"\n];';
                parseCode(code);
                assert.equal(symbol.code, '[\n\t"some", \n\t"property"\n]');
            });
        });

        it.describe("matching /^\"?(\\w+)\"? *\\: *function/", function (it) {
            var code = 'testFunction:function (str1,str2) {\n    },';

            it.should('parse code', function () {
                parseCode(code);
                assert.equal(symbol.code, "function (str1,str2){\n   \n}");
            });

            it.should('parse name', function () {
                parseCode(code);
                assert.equal(symbol.name, "testFunction");
            });

            it.should("set isConstructor to false", function(){
                parseCode(code);
                assert.isFalse(symbol.isConstructor);
            });

            it.should("set isConstructor if name begins with a capital letter", function(){
                var code = 'TestFunction:function (str1,str2) {\n    },';
                parseCode(code);
                assert.isTrue(symbol.isConstructor);
            });

            it.should("set isConstructor to false if whole name is all caps", function(){
                var code = 'TEST_FUNCTION:function (str1,str2) {\n    },';
                parseCode(code);
                assert.isFalse(symbol.isConstructor);
            });

            it.should("set isPrivate to tue if name begins with _", function(){
                parseCode('_testFunction:function (str1,str2) {\n    },');
                assert.isTrue(symbol.isPrivate);
            });

            it.should("should set isStatic to true if activeScope does not include prototype", function(){
                parseCode(code);
                assert.isTrue(symbol.isStatic);
            });

            it.should("should set isStatic to false if activeScope does include prototype", function(){
                context.activateScope("MyObject.prototype");
                parseCode(code);
                assert.isFalse(symbol.isStatic);
            });
        });

        it.describe("matching /^\"?(\\w+)\"? *\\: *([^,\\n]+)/", function (it) {
            var code = 'testProperty:"some property"\n};';

            it.should('parse code', function () {
                parseCode(code);
                assert.equal(symbol.code, '"some property"');
            });

            it.should('parse name', function () {
                parseCode(code);
                assert.equal(symbol.name, "testProperty");
            });

            it.should("set isPrivate to tue if name begins with _", function(){
                parseCode('_testFunction:function (str1,str2) {\n    },');
                assert.isTrue(symbol.isPrivate);
            });

            it.should("should set isStatic to true if activeScope does not include prototype", function(){
                parseCode(code);
                assert.isTrue(symbol.isStatic);
            });

            it.should("should set isStatic to false if activeScope does include prototype", function(){
                context.activateScope("MyObject.prototype");
                parseCode(code);
                assert.isFalse(symbol.isStatic);
            });

            it.should('parse code with new lines', function () {
                var code = 'testProperty : [\n\t"some", \n\t"property"\n];';
                parseCode(code);
                assert.equal(symbol.code, '[\n\t"some", \n\t"property"\n]');
            });

            it.should('parse properties that are objects', function () {
                var code = 'testProperty : {\n\tx:"y"\n}';
                parseCode(code);
                assert.equal(symbol.code, '{\n\tx:"y"\n}');
            });

            it.should('parse properties that are arrays', function () {
                var code = 'testProperty : [\n\t"some", \n\t"property"\n];';
                parseCode(code);
                assert.equal(symbol.code, '[\n\t"some", \n\t"property"\n]');
            });
        });


        it.run();
    });
})();