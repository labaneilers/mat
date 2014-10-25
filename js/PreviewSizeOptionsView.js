/*jsl:option explicit*/
/* global mat, Backbone */

"use strict";

mat.PreviewSizeOptionsView = Backbone.View.extend({
    initialize: function () {
        this.dataBind({
            "#previewSize": "previewSize"
        });
    }
});
