/*jsl:option explicit*/
/* global mat, Backbone */

"use strict";

mat.OptionsView = Backbone.View.extend({
	el: ".params-options-section",
	
    initialize: function () {
        this.dataBind({
            "#enableTokenPreview": "enableTokenPreview",
            "#showOverlays": "showOverlays"
        }, true);
    }
});
