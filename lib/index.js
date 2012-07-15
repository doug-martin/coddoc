(function () {
    "use strict";
    var fs = require("fs"),
        path = require("path"),
        EventEmitter = require("events").EventEmitter,
        parser = require("./parser"),
        Tree = require("./tree.js"),
        Context = require("./context.js");

    var FILE_PATTERN = /\.js$/i;
    var emitter = new EventEmitter();
    /**
     * @projectName coddoc
     * @github https://github.com/doug-martin/coddoc
     *
     * @header
     *
     * <h1>Coddoc</h1>
     *
     * <h2> Description</h2>
     * <p>
     *     coddoc is a jsdoc parsing library. Coddoc is different in that it is easily extensible by allowing users to
     *     add tag and code parsers through the use of {@link coddoc.addTagHandler} and {@link coddoc.addCodeHandler}.
     *     coddoc also parses source code to be used in APIs.
     * </p>
     *
     * <p>
     *     Coddoc also supports the generation of markdown and html through the use of different templates. Currently
     *     the templates use <a href="http://handlebarsjs.com/">Handlebars</a> but you may use any templating engine
     *     you wish
     * </p>
     * <h3>JSDOC Tags</h3>
     * <p>
     *     JSDoc tags currently supported are:
     *     <ul>
     *          <li>augments|extends : extend an object</li>
     *          <li>lends : document all members of an anonymous object as members of a declared symbol</li>
     *          <li>namespace : document a namespace</li>
     *          <li>parameter|param|arg|argument : parameters of a function</li>
     *          <li>return|returns : return value of a function</li>
     *          <li>memberof|memberOf : explicitly document a cod block as a member of an object</li>
     *          <li>name : explicitly document the name of a symbol</li>
     *          <li>constructor|constructs : document a symbol as a constructor for a class</li>
     *          <li>class : documents a symbol as a class</li>
     *          <li>classdesc : alternate way to add a description to a class</li>
     *          <li>example : document an example/s of a symbol</li>
     *          <li>private : document a symbol as private.</li>
     *          <li>ignore : allows you to document a symbol but ignore it in parsing</li>
     *          <li>method|function : explicily document a symbol as a method</li>
     *          <li>field : explicily document a symbol as a field</li>
     *          <li>type : document the type of a field</li>
     *          <li>default : document the default value of a field</li>
     *          <li>throws|throw|exception : document any exception thrown by a method</li>
     *          <li>property : document a property in the constructor declaration of a class</li>
     *          <li>borrows : document any filed/methods borrowed from a class</li>
     *          <li>constant|const : document a field as a constant</li>
     *          <li>desc|description : alternate way to explicitly document the description of a symbol</li>
     *          <li>public:explicitly document a symbol as public</li>
     *     </ul>
     *
     * <h3>Coddoc Tags</h3>
     *     Coddoc also has a few additional tags.
     *     <ul>
     *          <li>ignoreCode : ignore the parsed code in the output</li>
     *          <li>includeDoc : include an external doc. External docs can be html or markdown.
     *          Example {@code &#64;includeDoc [Title Of Doc] ../location/of_doc.md}
     *          </li>
     *          <li>projectName : document the projectName</li>
     *          <li>github : url to github project</li>
     *          <li>code : specifies a code block without needing an <code>example</code> tag
     *          Example {@code &#123;&#64;code var test = "test"; &#125;}
     *          </li>
     *
     *          <li>header : allows you to document a header that should appear before
     *          generated documentation</li>
     *          <li>footer : allows you to document a footer that should come after the generated documentation</li>
     *          <li>protected : allows you to document a field as protected</li>
     *     </ul>
     * </p>
     *
     * <h2>Installation</h2>
     * Locally
     * {@code npm install coddoc}
     * Globally
     *
     * {@code npm install -g coddoc}
     *
     * <h2>Usage</h2>
     * Down doc does not currently create multi file docs instead will output to a single file. You may however implement
     * your own formatter to create multiple files.
     *
     * Command line options
     *
     * <ul>
     *     <li>-d --directory : the directory that contains your code</li>
     *     <li>[-f --formatter] : optional formatter to use, if not specified then a JSON object of the symbols will
     *     be output</li>
     *     <li>[-p --pattern] : optional file pattern to use when searching for files</li>
     * </ul>
     *
     * Examples
     *
     * JSON output
     * {@code coddoc -d ./lib > symbols.json}
     *
     * To use the markdown formatter
     * {@code coddoc -d ./lib -f markdown > README.md}
     *
     * To use the HTML formatter
     * {@code coddoc -d ./lib -f html > index.html}
     *
     * To use pragmatically
     *
     * {@code
     * var coddoc = require("coddoc");
     * var tree = coddoc.parse({directory : __dirname + "/lib"});
     * var classes = tree.classes, namespaces = tree.namespaces;
     * //do something
     * }
     *
     *
     *
     *
     * <h2>API</h2>
     *
     *
     * @footer
     *
     * <h2>License</h2>
     *
     * <p>MIT <a href = https://github.com/Pollenware/coddoc/raw/master/LICENSE>LICENSE</a><p>
     *
     * <h2>Meta</h2>
     * <hr>
     * <p>Code: <code>git clone git://github.com/pollenware/coddoc.git</code></br></p>
     */

    /**
     * @namespace Entry point for parsing code.
     *
     * @example
     * var tree = coddoc({directory : path.resolve(__dirname + "lib")});
     *
     * //To use markdown formatter
     * var doc = coddoc({directory : path.resolve(__dirname + "lib"), formatter : coddoc.formatters.markdown});
     *
     * //To use html formatter
     * var doc = coddoc({directory : path.resolve(__dirname + "lib"), formatter : coddoc.formatters.html});
     *
     * //To use custom file pattern
     * var doc = coddoc({directory : path.resolve(__dirname + "lib"), patter : /.+\.test\.js$/i, formatter : coddoc.html});
     *
     *
     *
     * @param {Object} options options object.
     * @param {String} options.dir the directory of code to parse.
     * @param {RegExp} [options.pattern=/.+\.js$/i] a regular expression to test files agains
     * @param {Object} [options.formatter] And optional formatter to format the tree. The object must contain
     * a <code>generate</code> method. See {@link coddoc.formatters.html}
     */
    var coddoc = function (options) {

        options = options || {};

        var baseDir = options.dir, filePattern = options.pattern || FILE_PATTERN;
        if (!baseDir) {
            console.log("directory required");
        }


        var fileMap = {};
        (function findFiles(dir) {
            var files = fs.readdirSync(dir);
            files.forEach(function (file) {
                var filePath = path.resolve(dir, file);
                var stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    findFiles(filePath);
                } else if (stat.isFile() && filePattern.test(file)) {
                    fileMap[filePath] = fs.readFileSync(filePath, "utf8");
                }
            });
        }(baseDir));

        var context = new Context(), tree = new Tree();
        Object.keys(fileMap).forEach(function (i, j) {
            emitter.emit("file", i);
            context.activateScope("global");
            parser.parse(fileMap[i], path.relative(baseDir, i), tree, context, emitter);
        });
        return tree;
    };
    module.exports = coddoc;
    coddoc.getEmitter = function () {
        return emitter;
    };
    coddoc.parseTag = parser.parseTag;
    coddoc.addTagHandler = parser.addTagHandler;
    coddoc.addCodeHandler = parser.addCodeHandler;
    coddoc.tags = parser.tags;

}());



