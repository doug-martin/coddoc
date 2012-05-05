(function () {
    "use strict";
    /**
     * @namespace A test namespace
     * @memberof test
     */
    exports.namespace = {
        /**@lends test.namespace*/

        /**
         * A test funtion
         * @param {String} str1 the first string
         * @param {String} [str2] optional second string
         * @return {String} a string
         */
        testFunction:function (str1, str2) {
            return "testFunction";
        },

        /**
         * Test property 1
         */
        testProperty1:"property",

        /**
         * Test property2
         */
        testProperty2:[
            "property0",
            "property1"
        ],

        /**
         * Test property 3
         * @default {property0 : 0, property1 : 1}
         */
        testProperty3:{
            property0:0,
            property1:1
        }
    };

    /**
     * A test class
     * @memberof test
     * @param {Object} props properties to set on this object
     * @constructor
     */
    var MyObject = function (props) {
        props = props || {};
        for (var i in props) {
            if (this.hasOwnProperty(i)) {
                this[i] = props[i];
            }
        }
    };

    /**
     * A test function
     * @memberOf test.MyObject#
     * @param {String} str1 the first string
     * @param {String} [str2] optional second string
     * @return {String} a string
     */
    MyObject.prototype.testFunction = function (str1, str2) {
        return str1.replace(str2, "{{str2}}");
    };

    /**
     * Test property 1
     * @memberOf test.MyObject#
     */
    MyObject.prototype.testProperty1 = "property";

    /**
     * Test property2
     * @memberOf test.MyObject#
     */
    MyObject.prototype.testProperty2 = [
        "property0",
        "property1"
    ];

    /**
     * A test function
     * @memberOf test.MyObject
     * @param {String} str1 the first string
     * @param {String} [str2] optional second string
     * @return {String} a string
     */
    MyObject.testFunction = function (str1, str2) {
        return str1.replace(str2, "{{str2}}");
    };

    /**
     * Test property 1
     * @memberOf test.MyObject
     */
    MyObject.testProperty1 = "property";

    /**
     * Test property2
     * @memberOf test.MyObject
     */
    MyObject.testProperty2 = [
        "property0",
        "property1"
    ];
})();