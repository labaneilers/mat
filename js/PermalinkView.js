/*jsl:option explicit*/
/* global require, module */

var $ = require("jquery");
var Backbone = require("backbone");
Backbone.$ = $;

var PermalinkView = Backbone.View.extend({
    initialize: function () {
        this.listenTo(this.model.languages, "change", this.refresh);
        this.listenTo(this.model.parameters, "change", this.refresh);
        this.listenTo(this.model.options, "change", this.refresh);

        this.refresh();
    },

    refresh: function () {
        var url = new $.Url(document.location.pathname);
        url.queryString.src = this.model.options.get("assetPath");

        var options = this.model.options.toJSON();
        delete options.assetPath;
        url.queryString.options = $.param(options);

        url.queryString.languages = this.model.languages.getSelectedIds().join(",");
        url.queryString.parameters = $.param(this.model.parameters.toMap());
        url.queryString.useqs = 1;

        $(".permalink").attr("href", url.toString());
    }
});

module.exports = PermalinkView;
