/*jsl:option explicit*/
/* global require, module */

var $ = require("jquery");
var Backbone = require("backbone");
Backbone.$ = $;

var ParameterView = Backbone.View.extend({
    initialize: function () {
        this.model.set("name", this.$el.find("label").html());
        this.$input = this.$el.find(".param-value");
        this.listenTo(this.model, "change:value", this.setValue);
    },

    getValue: function () {
        return this.$input.val();
    },

    setValue: function () {
        this.$input.val(this.model.get("value"));
    },

    updateModel: function () {
        this.model.set("value", this.getValue());
    }
});

module.exports = ParameterView;
