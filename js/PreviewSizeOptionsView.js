/*jsl:option explicit*/
/* global require, module */

var $ = require("jquery");
var Backbone = require("backbone");
Backbone.$ = $;

var dataBind = require("./backbone.databind");

var PreviewSizeOptionsView = Backbone.View.extend({
    initialize: function () {
        dataBind(
        	this,
        	{
	            "#previewSize": "previewSize"
	        });
    }
});

module.exports = PreviewSizeOptionsView;
