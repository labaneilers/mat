/*jsl:option explicit*/
/* global require, module */

var $ = require("jquery");
var Backbone = require("backbone");
Backbone.$ = $;

var dataBind = require("./backbone.databind");

var OptionsView = Backbone.View.extend({
	el: ".params-options-section",
	
    initialize: function () {
        dataBind(
        	this,
        	{
	            "#enableTokenPreview": "enableTokenPreview",
	            "#showOverlays": "showOverlays"
	        }, true);
    }
});

module.exports = OptionsView;
