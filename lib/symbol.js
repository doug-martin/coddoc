(function () {
    "use strict";
    /**
     * A Symbol represents a comment and code pair. Each code handler added through {@link coddoc.addCodeHandler} and
     * tag handler added through {@link coddoc.addTagHandler} adds/removes properties from a the symbol. Each symbol is
     * added to the {@link coddoc.Tree} which is either returned from {@link coddoc} or passed into a template handler.
     *
     * <b>NOTE: This object should not be instantiated by user code</b>
     *
     *
     * @param {Object|coddoc.Symbol} options an object or symbol whos properties will be added to this symbol. Note a deep
     * copy of paraemeters will not be made, so if you pass an array the array will not be cloned.
     * @private
     * @constructor
     * @memberOf coddoc
     */
    var Symbol = function (options) {
        this.tags = [];
        this.params = [];
        this.properties = [];
        this.examples = [];
        this.borrows = [];
        this.augments = [];
        this.includedDocs = [];
        this.see = [];
        this.throws = [];
        this.returns = [];
        options = options || {};
        for (var i in options) {
            if (i in this) {
                this[i] = options[i];
            }
        }
    };



    /**
     * The name of this symbol
     * @memberOf coddoc.Symbol#
     * @type {String}
     */
    Symbol.prototype.name = "";
    /**
     * Who this symbol belongs to.
     * @memberOf coddoc.Symbol#
     * @type {String}
     */
    Symbol.prototype.memberof = "";
    /**
     * The fullname i.e ({memberof}.{name})
     * @memberOf coddoc.Symbol#
     * @type {String}
     */
    Symbol.prototype.fullname = "";
    /**
     * The type that is symbol represents.
     * @memberOf coddoc.Symbol#
     * @type {*}
     */
    Symbol.prototype.type = null;
    /**
     * The description of this symbol.
     * @memberOf coddoc.Symbol#
     * @type {String}
     */
    Symbol.prototype.description = "";
    /**
     * The file where the symbol was found.
     * @memberOf coddoc.Symbol#
     * @type {String}
     */
    Symbol.prototype.file = "";
    /**
     * Set to true if this symbol is a function.
     * @memberOf coddoc.Symbol#
     * @type {Boolean}
     */
    Symbol.prototype.isFunction = false;
    /**
     * Set to true is this symbol is a constructor
     * @memberOf coddoc.Symbol#
     * @type {Boolean}
     */
    Symbol.prototype.isConstructor = false;
    /**
     * Set to true if the code object from this symbol should be ignored.
     * @memberOf coddoc.Symbol#
     * @type {Boolean}
     */
    Symbol.prototype.ignoreCode = false;

    /**
     * Set to true if the symbol should be ignored and not put into {@link coddoc.Tree}
     * @memberOf coddoc.Symbol#
     * @type {Boolean}
     */
    Symbol.prototype.ignore = false;

    /**
     * The codeObject of this symbol
     * @memberOf coddoc.Symbol#
     * @type {Object}
     */
    Symbol.prototype.codeObject = null;
    /**
     * The associated tags for this symbol
     * @memberOf coddoc.Symbol#
     * @type {Array}
     * @default []
     */
    Symbol.prototype.tags = null;
    /**
     * The associated params for this symbol if it is a funciton.
     * @memberOf coddoc.Symbol#
     * @type {Array}
     * @default []
     */
    Symbol.prototype.params = null;
    /**
     * The associated properties for this symbol
     * @memberOf coddoc.Symbol#
     * @type {Array}
     * @default []
     */
    Symbol.prototype.properties = null;
    /**
     * The examples for this symbol
     * @memberOf coddoc.Symbol#
     * @type {Array}
     * @default []
     */
    Symbol.prototype.examples = null;
    /**
     * Any properties this symbol borrows
     * @memberOf coddoc.Symbol#
     * @type {Array}
     * @default []
     */
    Symbol.prototype.borrows = null;
    /**
     * Any symbols this symbol augments
     * @memberOf coddoc.Symbol#
     * @type {Array}
     * @default []
     */
    Symbol.prototype.augments = null;
    /**
     * Any link for this symbol
     * @memberOf coddoc.Symbol#
     * @type {Array}
     * @default []
     */
    Symbol.prototype.see = null;
    /**
     * Exceptions thrown by this symbol
     * @memberOf coddoc.Symbol#
     * @type {Array}
     * @default []
     */
    Symbol.prototype.throws = null;
    /**
     * Array of return types for this symbol
     * @memberOf coddoc.Symbol#
     * @type {Array}
     * @default []
     */
    Symbol.prototype.returns = null;
    /**
     * Set to true if this symbol is protected.
     * @memberOf coddoc.Symbol#
     * @type {Boolean}
     */
    Symbol.prototype.isProtected = false;
    /**
     * Set to true if this symbol is private.
     * @memberOf coddoc.Symbol#
     * @type {Boolean}
     */
    Symbol.prototype.isPrivate = false;
    /**
     * Set to true if this symbol is static
     * @memberOf coddoc.Symbol#
     * @type {Boolean}
     */
    Symbol.prototype.isStatic = false;
    /**
     * Set to true if this symbol is a constant.
     * @memberOf coddoc.Symbol#
     * @type {Boolean}
     */
    Symbol.prototype.isConstant = false;


    module.exports = Symbol;
}());