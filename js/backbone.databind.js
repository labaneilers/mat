/*jsl:option explicit*/
/* global jQuery, Backbone */

"use strict";

(function ($) {

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

    Backbone.View.prototype.dataBind = function (map, initializeDOM) {
        for (var key in map) {
            var $el = key.indexOf("#") === 0 ? $(key) : this.$el.find(key);
            dataBindEl($el, this.model, map[key], initializeDOM);
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

})(jQuery);
