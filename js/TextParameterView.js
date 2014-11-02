/*jsl:option explicit*/
/* global require, module */

var _ = require("underscore");

var ParameterView = require("./ParameterView");

var TextParameterView = ParameterView.extend({
    events: {
        "keyup input": "keyupHandler"
    },

    keyupHandler: _.debounce(function () {
        this.updateModel();
    }, 1000)
});

module.exports = TextParameterView;