/*jsl:option explicit*/
/* global require, module */

var ParameterView = require("./ParameterView");

var MenuParameterView = ParameterView.extend({
        events: {
            "change select.param-value": "updateModel"
        }
    });

module.exports = MenuParameterView;