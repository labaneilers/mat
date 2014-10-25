/*jsl:option explicit*/
/* global mat, jQuery, Backbone */

"use strict";

(function (mat, $) {

mat.LanguageView = Backbone.View.extend({
    initialize: function () {
        this.dataBind({
            ".language-id": "enabled"
        });
    }
});

mat.createLanguageViews = function () {
	return $(".language-toolbar .language-link").map(function (index, el) {
        return new mat.LanguageView({ 
            el: el,
            model: new mat.Language({ id: $(el).attr("for"), name: $(el).find("input").attr("name") })
        });
    });
};

}(mat, jQuery));
