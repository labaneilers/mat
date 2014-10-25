/*jsl:option explicit*/
/* global mat, Backbone */

"use strict";

mat.LanguageOptionsView = Backbone.View.extend({

    el: ".language-toolbar-options",

    events: {
        "click .clear-all": "clearAll",
        "click .select-all": "selectAll"
    },

    selectAll: function () { this.updateAll(true); },

    clearAll: function () { this.updateAll(false); },

    updateAll: function (enabled) {
        this.model.forEach(function (language) {
            language.set("enabled", enabled);
        });
    }
});
