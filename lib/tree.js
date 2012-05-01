var utils = require("./util.js"),
    Symbol = require("./symbol.js");

/**
 * A Tree object which contains symbols.
 *
 * @private
 * @memberof coddoc
 * @constructor
 *
 */
var Tree = function () {
    this.symbols = {global:[]};
};

/**
 * Adds a symbol to this tree.
 * @private
 * @memberOf coddoc.Tree#
 * @param {String} name the name of the symbol to add.
 * @return {Array}
 */
Tree.prototype._addSymbol = function (name) {
    var ret = this.symbols[name];
    if (!ret) {
        ret = this.symbols[name] = [];
    }
    return ret;
};

/**
 * Returns true if this tree contains a symbol.
 *
 * @memberOf coddoc.Tree#
 * @param name the name to test if the tree contains the symbol
 *
 * @return {Boolean} true if the tree contains the symbol.
 */
Tree.prototype.hasSymbol = function (name) {
    var parts = name.split(".");
    return !!this.symbols[name];
};

/**
 * Returns a symbol from this tree. The Tree will create the symbol if it does not exist.
 *
 * @memberOf coddoc.Tree#
 * @param {String} name the name of the symbol to get
 * @return {Array} the array for the symbol.
 */
Tree.prototype.getSymbol = function (name) {
    return this._addSymbol(name);
};

/**
 * Entry point to add the symbol
 * @memberOf coddoc.Tree#
 * @param {String} path the path of the symbol. i.e the memberof property of a symbol
 * @param name
 * @param obj
 */
Tree.prototype.addSymbol = function (symbol) {
    var path = symbol.memberof, name = symbol.name;
    path == "global" && (path = name);
    var sym = this.getSymbol(path);
    sym.push(symbol);
};
/**
 * Gets all members({@link coddoc.Symbol}) for a particular path.
 * @memberOf coddoc.Tree#
 * @param {String} path the path to look up.
 * @return {Array} and array of symbols.
 */
Tree.prototype.getMembers = function (path) {
    var symbols = this.symbols,
        namespaces = [],
        keys = Object.keys(this.symbols);
    keys.forEach(function (k) {
        namespaces = namespaces.concat(symbols[k].filter(function (s) {
            return !s.isNamespace && !s.isConstructor && s.memberof === path;
        }));
    });
    return namespaces;
};

/**
 * Returns all namespaces in this tree. This method also adds the following values to the namespace.
 *
 * <ul>
 *     <li>properties : all properties that belong to the namespace</li>
 *     <li>methods : all methods that belong to the namespace</li>
 * </ul>
 *
 * @memberOf coddoc.Tree#
 * @return {Array} array of namespaces
 */
Tree.prototype.getNamespaces = function () {
    var symbols = this.symbols,
        namespaces = [],
        keys = Object.keys(this.symbols);
    keys.forEach(function (k) {
        namespaces = namespaces.concat(symbols[k].filter(function (s) {
            return s.isNamespace;
        }));
    });
    return namespaces.map(function (s) {
        var realName = s.memberof && s.memberof != "global" ? [s.memberof, s.name].join(".") : s.name;
        var members = this.getMembers(realName);
        s.name = realName;
        s.properties = members.filter(function (m) {
            return !m.isFunction;
        });
        s.methods = members.filter(function (m) {
            return m.isFunction;
        });
        return s;
    }, this);
};

Tree.prototype.getHeaders = function () {
    var symbols = this.symbols,
        headers = [],
        keys = Object.keys(this.symbols);
    keys.forEach(function (k) {
        headers = headers.concat(symbols[k].filter(function (s) {
            return s.isHeader;
        }));
    });
    return headers;
};

Tree.prototype.getFooters = function () {
    var symbols = this.symbols,
        footers = [],
        keys = Object.keys(this.symbols);
    keys.forEach(function (k) {
        footers = footers.concat(symbols[k].filter(function (s) {
            return s.isFooter;
        }));
    });
    return footers;
};

Tree.prototype.getProjectName = function () {
    var symbols = this.symbols,
        names = [],
        keys = Object.keys(this.symbols);
    keys.forEach(function (k) {
        names = names.concat(symbols[k].filter(function (s) {
            return s.isProjectName;
        }));
    });
    return names.length ? names[0].projectName : null;
}

/**
 * Returns all classes in the tree. The following properties are added to each class symbol.
 *
 * <ul>
 *     <li>staticMethods : all static methods for the class</li>
 *     <li>staticProperties : all static properties for the class</li>
 *     <li>instanceMethods : all isntance methods for the class</li>
 *     <li>instanceProperties : all instance properties for a class</li>
 * </ul>
 *
 * @memberOf coddoc.Tree#
 * @return {Array}
 */
Tree.prototype.getClasses = function () {
    var symbols = this.symbols,
        objects = [],
        keys = Object.keys(this.symbols);
    keys.forEach(function (k) {
        objects = objects.concat(symbols[k].filter(function (s) {
            return s.isConstructor;
        }));
    });
    return objects.map(function (s) {
        var name = s.fullName;
        var statics = symbols[name] || [];
        var instance = symbols[name + ".prototype"] || [];
        var borrowedMethods = [], borrowedProperties = [], staticBorrowedMethods = [], staticBorrowedProperties = []
        s.borrows.map(function (b) {
            var borrows = b.borrows;
            var symbol = symbols[borrows.memberof || "global"].filter(function (s) {
                return s.name === borrows.name;
            });
            if (symbol.length) {
                symbol = symbol[0];
                var memberof = b.isStatic ? name : name + ".prototype";
                var newSymb = new Symbol(utils.merge({}, symbol, {name:b.as, isStatic:b.isStatic, fullName:memberof + "." + b.as, memberof:memberof}));
                if (b.isStatic) {
                    if (s.isFunction) {
                        staticBorrowedMethods.push(newSymb);
                    } else {
                        staticBorrowedProperties.push(newSymb);
                    }
                } else {
                    if (s.isFunction) {
                        borrowedMethods.push(newSymb);
                    } else {
                        borrowedProperties.push(newSymb);
                    }
                }

            }
        });
        s.name = name;
        s.staticMethods = statics.filter(
            function (s) {
                return s.isFunction && !s.isConstructor;
            }).concat(staticBorrowedMethods);
        s.staticProperties = statics.filter(
            function (s) {
                return !s.isFunction && !s.isNamespace;
                ;
            }).concat(staticBorrowedProperties);

        s.instanceMethods = instance.filter(
            function (s) {
                return s.isFunction && !s.isConstructor;
            }).concat(borrowedMethods);
        s.instanceProperties = instance.filter(
            function (s) {
                return !s.isFunction && !s.isNamespace;
            }).concat(s.properties || []).concat(borrowedProperties);
        return s;
    });
};

Tree.prototype.toJSON = function () {
    return {namespaces:this.getNamespaces(), classes:this.getClasses(), headers:this.getHeaders(), footers:this.getFooters(), projectName:this.getProjectName()};
}

exports.Tree = Tree;