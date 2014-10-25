/*jsl:option explicit*/
/* global mat, jQuery, Backbone */

"use strict";

(function (mat, $) {

    mat.PreviewView = Backbone.View.extend({

        tagName: "div",

        initialize: function () {
            this.listenTo(this.model.parameters, "change", this.refresh);
            this.listenTo(this.model.language, "change", this.refresh);
            this.listenTo(this.model.options, "change", this.refresh);
        },

        render: function () {
            /* jshint quotmark:false */
            this.$el.addClass("image-section");

            //this.$iframe = $('<iframe src="' + iframeUrl.toString() + '" scrolling="no" />');
            this.$iframe = $("<div />");
            
            this.$el
                .append("<h3>" + this.model.language.get("name") + "</h3>")
                .append(this.$iframe);

            this.refresh();

            return this;
        },

        refresh: function () {
            if (!this.model.language.get("enabled")) {
                this.$el.hide();
            } else {
                var iframeUrl = new $.Url("/Root/Utility/MerchandisingAssetPreview");
                iframeUrl.queryString.src = this.model.options.get("assetPath");
                iframeUrl.queryString.langid = this.model.language.get("id");
                iframeUrl.queryString.parameters = $.param(this.model.parameters.toMap());
                iframeUrl.queryString.previewMode = this.model.options.get("previewMode");
                iframeUrl.queryString.showOverlays = this.model.options.get("showOverlays") ? 1 : 0;

                //this.$iframe.attr("src", iframeUrl.toString());
                this.$iframe.text(iframeUrl.toString() + " size:" + this.model.options.get("previewSize"));

                this.$el.show();
            }
        }
    });

})(mat, jQuery);
