/*jsl:option explicit*/
/* global require, module */

var $ = require("jquery");
var Backbone = require("backbone");
Backbone.$ = $;

var bindings = {
    checkbox: {
        getter: function ($el) {
            return $el.prop("checked");
        },
        setter: function ($el, value) {
            $el.prop("checked", value.toString() == "true");
        }
    },
    default: {
        getter: function ($el) {
            return $el.val();
        },
        setter: function ($el, value) {
            $el.val(value);
        }
    }
};

var dataBindEl = function ($el, model, property, initializeDOM) {
    var binding = bindings.default;
    var eventName = "change";

    var tagName = $el.prop("tagName");
    if (tagName == "INPUT") {
        var type = $el.attr("type");

        if (type == "checkbox") {
            binding = bindings.checkbox;
            eventName = "click";
        }
    }

    $el.on(eventName, function () {
        model.set(property, binding.getter($el));
    });

    var onChange = function () {
        binding.setter($el, model.get(property));
    };

    model.on("change:" + property, onChange);

    if (initializeDOM) {
        onChange();
    }
};

// Bind key value pairs where the key is a DOM element selector, 
// and the value is the name of the property in the view's model.
// If initializeDOM is true, then the DOM element is initialized from the model immediately.
module.exports = function (view, map, initializeDOM) {
    for (var key in map) {
        var $el = key.indexOf("#") === 0 ? $(key) : view.$el.find(key);
        dataBindEl($el, view.model, map[key], initializeDOM);
    }
};
