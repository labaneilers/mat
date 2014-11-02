
/*jsl:option explicit*/
/* global require, module */

var ParameterView = require("./ParameterView");

var BooleanParameterView = ParameterView.extend({
    events: {
        "change input[type=checkbox]": "updateModel"
    },

    getValue: function () {
        return this.$input.prop("checked");
    },

    setValue: function () {
        this.$input.prop("checked", this.model.get("value").toString() == "true");
    }
});

module.exports = BooleanParameterView;