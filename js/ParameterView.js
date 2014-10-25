/*jsl:option explicit*/
/* global _, mat, Backbone */

"use strict";

mat.ParameterView = Backbone.View.extend({
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

mat.TextParameterView = mat.ParameterView.extend({
    events: {
        "keyup input": "keyupHandler"
    },

    keyupHandler: _.debounce(function () {
        this.updateModel();
    }, 1000)
});

mat.MenuParameterView = mat.ParameterView.extend({
    events: {
        "change select.param-value": "updateModel"
    }
});

mat.BooleanParameterView = mat.ParameterView.extend({
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

mat.ProductParameterView = mat.TextParameterView.extend({
    initialize: function () {

        mat.ProductParameterView.__super__.initialize.apply(this); 

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
