/**
 * A Context object used to keep state when parsing symbols.
 * The context should not be used directly by user code.
 *
 * @memberOf coddoc
 * @constructor
 */
var Context = function () {
    this.scopes = {};
    this.nameSpaces = {global:[]};
    this.aliases = {};
    this.activateScope("global");
}

/**
 * Adds a namespace the the context object.
 * @memberOf coddoc.Context#
 * @param {String} name the name of the namespace
 * @return {Object} the object for the namespace.
 */
Context.prototype.addNamespace = function (name) {
    if ("undefined" === typeof this.nameSpaces[name]) {
        this.nameSpaces[name] = {};
    }
    return this.nameSpaces[name];
};

/**
 * Gets a namespace, creating it if it does not exist.
 *
 * @memberOf coddoc.Context#
 * @param {String} name the name of the context
 * @return {Object} the object for the namespace.
 */
Context.prototype.getNamespace = function (name) {
    return this.addNamespace(name);
};


/**
 * Adds a scope to the context
 *
 * @memberOf coddoc.Context#
 * @param {String} name the name of the scope to add,
 * @return {Object} the object for the namespace.
 */
Context.prototype.addScope = function (name) {
    if ("undefined" === typeof this.scopes[name]) {
        this.scopes[name] = {};
    }
    return this.scopes[name];
};

/**
 * Gets a scope creating it if it does not exist.
 *
 * @memberOf coddoc.Context#
 * @param {String} name the name of the scope to get,
 * @return {Object} the object for the namespace.
 */
Context.prototype.getScope = function (name) {
    return this.addScope(name);
};

/**
 * Activates a scope for.
 * @memberOf coddoc.Context#
 * @param {String} name the name of the scope.
 * @return {Object} the activated scope object.
 */
Context.prototype.activateScope = function (name) {
    this.activeScope = name;
    return this.addScope(name);
};

/**
 * Returns the active scope.
 *
 * @memberOf coddoc.Context#
 * @return {Object} the scope object
 */
Context.prototype.getActiveScope = function () {
    return this.getScope(this.activeScope);
};

/**
 * Returns the name of the active scope.
 *
 * @memberOf coddoc.Context#
 * @return {String} the active scope name.
 */
Context.prototype.getActiveScopeName = function () {
    return this.activeScope;
};
exports.Context = Context;
