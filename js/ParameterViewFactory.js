/*jsl:option explicit*/
/* global require, module */

var $ = require("jquery");
var Backbone = require("backbone");
Backbone.$ = $;

var BooleanParameterView = require("./BooleanParameterView");
var ProductParameterView = require("./ProductParameterView");
var MenuParameterView = require("./MenuParameterView");
var TextParameterView = require("./TextParameterView");
var Models = require("./Models");

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