(function () {
    "use strict";
    var it = require("it"),
        fs = require("fs"),
        path = require("path"),
        assert = require("assert"),
        EventEmitter = require("events").EventEmitter,
        Tree = require("../../lib/tree.js"),
        Context = require("../../lib/context.js"),
        parser = require("../../lib/parser");


    it.describe("coddoc/parser", function (it) {

        var file = fs.readFileSync(path.resolve(__dirname, "./assets/parser.file.js"), "utf8");
        var emitter = new EventEmitter(),
            tree = new Tree();
        it.should("parse the file and gather all symbols", function () {
            parser.parse(file, "", tree, new Context(), emitter);
            console.dir(tree);
            var classes = tree.getClasses(), namespaces = tree.getNamespaces();
            assert.lengthOf(classes, 1);
            assert.lengthOf(namespaces, 1);
            var cls = classes[0];
            assert.equal(cls.name, "test.MyObject");
            assert.equal(cls.memberof, "test");
            assert.isTrue(cls.isConstructor, true);
            assert.lengthOf(cls.instanceMethods, 1);
            assert.lengthOf(cls.instanceProperties, 2);
            assert.lengthOf(cls.staticMethods, 1);
            assert.lengthOf(cls.staticProperties, 2);
            var namespace = namespaces[0];
            assert.lengthOf(namespace.methods, 1);
            assert.lengthOf(namespace.properties, 3);
        });

        it.run();
    });
})();



