/*jsl:option explicit*/
/* global _, jQuery, Backbone, mat */

"use strict";

(function (mat, $) {

    var COOKIE_PREFIX = "matData_";

    mat.AppView = Backbone.View.extend({

        el: "body",

        initialize: function (options) {
            var me = this;

            this.languageViews = $(".language-toolbar .language-link").map(function (index, el) {
                return new mat.LanguageView({ 
                    el: el,
                    model: new mat.Language({ id: $(el).attr("for"), name: $(el).find("input").attr("name") })
                });
            });

            this.languages = new mat.LanguageList(_(this.languageViews).pluck("model"));

            this.languageOptionsView = new mat.LanguageOptionsView({ model: this.languages, el: $(".language-toolbar-options") });

            this.parameterViews = $(".param-field").map(function (index, el) {
                var $input = $(el).find(".param-value");
                var type = $input.attr("type");
                var Ctor;

                if (type == "checkbox") {
                    Ctor = mat.BooleanParameterView;
                } else if (type == "text" && $input.hasClass("param-value-product")) {
                    Ctor = mat.ProductParameterView;
                } else if ($input.prop("tagName") == "SELECT") {
                    Ctor = mat.MenuParameterView;
                } else {
                    Ctor = mat.TextParameterView;
                }

                return new Ctor({ el: el, model: new mat.Parameter() });
            });

            this.parameters = new mat.ParameterList(_(this.parameterViews).pluck("model"));

            this.options = new mat.OptionsModel(options); // TODO plumb options, probably need a view

            this.optionsView = new mat.OptionsView({ model: this.options, el: $(".params-options-section") });

            this.permalinkView = new mat.PermalinkView({ 
                model: {
                    options: me.options,
                    languages: me.languages,
                    parameters: me.parameters
                }
            });

            this.previewSizeOptionsView = new mat.PreviewSizeOptionsView({ model: this.options });

            this.previewViews = this.languages.map(function (language) {
                return new mat.PreviewView({ 
                    model: {
                        options: me.options,
                        language: language,
                        parameters: me.parameters
                    }
                });
            });

            this.previewViews.forEach(function (previewView) {
                previewView.render().$el.appendTo("#ImageContainer");
            });

            // If a querystring with "useqs" was supplied,
            // this is a permalink. Use the data to restore cookies,
            // and then refresh the page to remove the querystring, otherwise
            // refreshing would wipe out any currently entered in the UI.
            var qs = $.currentQueryString();
            if (qs.useqs) {
                this.restoreFromQueryString(qs);
                this.saveCookies();

                var url = new $.Url(document.location.href);
                delete url.queryString.useqs;
                delete url.queryString.langauges;
                delete url.queryString.options;
                delete url.queryString.parameters;

                document.location.replace(url.toString());
            } else {
                this.restoreFromCookies();
            }

            // Save cookies on any model changes
            this.listenTo(this.parameters, "change", this.saveCookies);
            this.listenTo(this.languages, "change", this.saveCookies);
            this.listenTo(this.options, "change", this.saveCookies);
        },

        saveCookies: function () {
            var data = {
                languages: this.languages.getSelectedIds(),
                parameters: this.parameters.toMap(),
                options: this.options.toJSON()
            };

            delete (data.options).assetPath;

            $.cookies.set({ name: COOKIE_PREFIX + this.options.get("assetPath"), value: JSON.stringify(data) });
        },

        _restore: function (data) {
            var me = this;
            data.languages.forEach(function (languageId) {
                me.languages.getById(languageId).set("enabled", true);
            });

            this.parameters.fromMap(data.parameters);

            this.options.set(data.options);
        },

        restoreFromCookies: function () {
            var cookieValue = $.cookies.get(COOKIE_PREFIX + this.options.get("assetPath"));
            if (!cookieValue) {
                return;
            }

            this._restore(JSON.parse(cookieValue));
        },

        restoreFromQueryString: function (qs) {
            qs.languages = qs.languages ? qs.languages.split(",") : [];
            qs.parameters = $.deparam(qs.parameters);
            qs.options = $.deparam(qs.options);
            this._restore(qs);
        }
    });

})(mat, jQuery);
