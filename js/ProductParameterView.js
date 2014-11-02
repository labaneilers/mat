/*jsl:option explicit*/
/* global require, module */

var $ = require("jquery");
var Backbone = require("backbone");
Backbone.$ = $;

var TextParameterView = require("./TextParameterView");

var ProductParameterView = TextParameterView.extend({
    initialize: function () {

        ProductParameterView.__super__.initialize.apply(this); 

        this.$productTypeSelect = this.$el.find(".product-type-select");
    },

    events: {
        "change .product-type-select": "updateModel",
        "keyup input": "keyupHandler" // TODO inherit this to DRY it up
    },

    getValue: function() {
        var productType = this.$productTypeSelect.val();
        var productId = this.$input.val().trim();
        return productId ? productType + ":" + productId : "";
    },

    setValue: function() {
        var rawValue = this.model.get("value");
        var productType = "pc";
        var value = "";
        if (rawValue) {
            var parts = rawValue.split(":");
            if (parts.length >= 1) {
                productType = parts[0];

                if (parts.length >= 2) {
                    value = parts[1];
                }
            }
        }

        this.$productTypeSelect.val(productType);
        this.$input.val(value);
    }
});

module.exports = ProductParameterView;