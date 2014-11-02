/*jsl:option explicit*/
/* global require, module */

var $ = require("jquery");
var _ = require("underscore");
var Backbone = require("backbone");
Backbone.$ = $;

var LanguageView = require("./LanguageView");
var LanguageOptionsView = require("./LanguageOptionsView");
var PermalinkView = require("./PermalinkView");
var OptionsView = require("./OptionsView");
var PreviewView = require("./PreviewView");
var PreviewSizeOptionsView = require("./PreviewSizeOptionsView");
var createAllParameterViews = require("./ParameterViewFactory");

var Models = require("./Models");

var COOKIE_PREFIX = "matData_";

// This is the main application view, which composes all the other views and models.
var AppView = Backbone.View.extend({

    el: "body",

    initialize: function (options) {
        var me = this;

        this.model = {};

        // This application is optimized to have markup generated on the server. The views in this application
        // are primarily about data-binding DOM elements to models.

        // For the language and parameter views, build the views and models at the same time by iterating over DOM elements.
        // The models initial data comes from the DOM, so we're letting the view initialize the models.
        // Then, construct a LanguageList from the models already embedded in the views.

        this.languageViews = LanguageView.createLanguageViews();

        this.model.languages = new Models.LanguageList(_(this.languageViews).pluck("model"));

        this.parameterViews = createAllParameterViews();

        this.model.parameters = new Models.ParameterList(_(this.parameterViews).pluck("model"));

        // Options model is initialized from the options passed to AppView on application initialization
        // (determined by the server)
        // Then, options set by the user can be restored from cookies.
        this.model.options = new Models.OptionsModel(options);

        this.languageOptionsView = new LanguageOptionsView({ model: this.model.languages });

        this.optionsView = new OptionsView({ model: this.model.options });

        this.permalinkView = new PermalinkView({ model: this.model });

        this.previewSizeOptionsView = new PreviewSizeOptionsView({ model: this.model.options });

        // Build and render preview views for each language.
        this.previewViews = this.model.languages.map(function (language) {
            var previewView = new PreviewView({ 
                model: {
                    options: me.model.options,
                    language: language,
                    parameters: me.model.parameters
                }
            });

            previewView.render().$el.appendTo("#ImageContainer");

            return previewView;
        });

        // Restore state from cookies/querystring

        // If a querystring with "useqs" was supplied,
        // this is a permalink. Use the data to restore cookies,
        // and then refresh the page to remove the querystring, otherwise
        // refreshing would wipe out any currently entered in the UI.
        var qs = $.currentQueryString();
        if (qs.useqs) {
            this.restoreFromQueryString(qs);
            this.saveCookies();

            document.location.replace(this.getRedirectUrl());
        } else {
            this.restoreFromCookies();
        }

        // Save cookies on any model changes
        this.listenTo(this.model.parameters, "change", this.saveCookies);
        this.listenTo(this.model.languages, "change", this.saveCookies);
        this.listenTo(this.model.options, "change", this.saveCookies);
    },

    saveCookies: function () {
        var data = {
            languages: this.model.languages.getSelectedIds(),
            parameters: this.model.parameters.toMap(),
            options: this.model.options.toJSON()
        };

        delete (data.options).assetPath;

        $.cookies.set({ name: COOKIE_PREFIX + this.model.options.get("assetPath"), value: JSON.stringify(data) });
    },

    _restore: function (data) {
        var me = this;
        data.languages.forEach(function (languageId) {
            me.model.languages.getById(languageId).set("enabled", true);
        });

        this.model.parameters.fromMap(data.parameters);

        this.model.options.set(data.options);
    },

    restoreFromCookies: function () {
        var cookieValue = $.cookies.get(COOKIE_PREFIX + this.model.options.get("assetPath"));
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
    },

    getRedirectUrl: function () {
        var url = new $.Url(document.location.href);
        delete url.queryString.useqs;
        delete url.queryString.langauges;
        delete url.queryString.options;
        delete url.queryString.parameters;

        return url.toString();
    }
});

module.exports.init = function (data) {
    new AppView(data);
};


