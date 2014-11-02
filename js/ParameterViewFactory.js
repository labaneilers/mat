/*jsl:option explicit*/
/* global require, module */

var $ = require("jquery");
var Backbone = require("backbone");
Backbone.$ = $;
var _ = require("underscore");

var Models = require("./Models");

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

var TextParameterView = ParameterView.extend({
    events: {
        "keyup input": "keyupHandler"
    },

    keyupHandler: _.debounce(function () {
        this.updateModel();
    }, 1000)
});

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

var MenuParameterView = ParameterView.extend({
    events: {
        "change select.param-value": "updateModel"
    }
});

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

var createAllParameterViews = function () {
    return $(".param-field").map(function (index, el) {
        var $input = $(el).find(".param-value");
        var type = $input.attr("type");
        var Ctor;

        if (type == "checkbox") {
            Ctor = BooleanParameterView;
        } else if (type == "text" && $input.hasClass("param-value-product")) {
            Ctor = ProductParameterView;
        } else if ($input.prop("tagName") == "SELECT") {
            Ctor = MenuParameterView;
        } else {
            Ctor = TextParameterView;
        }

        return new Ctor({ el: el, model: new Models.Parameter() });
    });
};

module.exports = createAllParameterViews;