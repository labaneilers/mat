/*jsl:option explicit*/
/* global require, module */

var $ = require("jquery");
var Backbone = require("backbone");
Backbone.$ = $;

var Models = require("./Models");
var dataBind = require("./backbone.databind");

var LanguageView = Backbone.View.extend({
    initialize: function () {
        dataBind(
            this, 
            {
                ".language-id": "enabled"
            });
    }
});

LanguageView.createLanguageViews = function () {
	return $(".language-toolbar .language-link").map(function (index, el) {
        return new LanguageView({ 
            el: el,
            model: new Models.Language({ id: $(el).attr("for"), name: $(el).find("input").attr("name") })
        });
    });
};

module.exports = LanguageView;
