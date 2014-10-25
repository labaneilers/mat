/*jsl:option explicit*/
/* global mat, Backbone */

"use strict";

mat.LanguageView = Backbone.View.extend({
    initialize: function () {
        this.dataBind({
            ".language-id": "enabled"
        });
    }
});
