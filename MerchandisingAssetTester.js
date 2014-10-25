/*jsl:option explicit*/
/* global _, jQuery, Backbone */

/// <reference path="../../../jquery/jquery-current.js" />
/// <reference path="../../../ThirdParty/backbone/underscore.js" />
/// <reference path="../../../ThirdParty/skinnyjs/jquery.cookies.js" />
/// <reference path="../../../ThirdParty/skinnyjs/jquery.querystring.js" />

"use strict";

var mat = {};

(function ($) {

    var COOKIE_PREFIX = "matData_";

    var bindings = {
        checkbox: {
            getter: function ($el) {
                return $el.prop("checked");
            },
            setter: function ($el, value) {
                $el.prop("checked", value.toString() == "true");
            }
        },
        default: {
            getter: function ($el) {
                return $el.val();
            },
            setter: function ($el, value) {
                $el.val(value);
            }
        }
    };

    Backbone.View.prototype.dataBind = function (map, initializeDOM) {
        for (var key in map) {
            var $el = key.indexOf("#") === 0 ? $(key) : this.$el.find(key);
            dataBindEl($el, this.model, map[key], initializeDOM);
        }
    };

    var dataBindEl = function ($el, model, property, initializeDOM) {
        var binding = bindings.default;
        var eventName = "change";

        var tagName = $el.prop("tagName");
        if (tagName == "INPUT") {
            var type = $el.attr("type");

            if (type == "checkbox") {
                binding = bindings.checkbox;
                eventName = "click";
            }
        }

        $el.on(eventName, function () {
            model.set(property, binding.getter($el));
        });

        var onChange = function () {
            binding.setter($el, model.get(property));
        };

        model.on("change:" + property, onChange);

        if (initializeDOM) {
            onChange();
        }
    };

    mat.Language = Backbone.Model.extend({
        defaults: function () {
            return {
                enabled: false,
                name: null,
                id: null
            };
        },
        initialize: function (options) {
            this.set("name", options.name);
            this.set("id", options.id);
        }
    });

    mat.LanguageList = Backbone.Collection.extend({
        model: mat.Language,

        initialize: function (models) {
            var me = this;
            this._map = {};
            models.forEach(function (language) {
                me._map[language.get("id")] = language;
            });
        },

        getSelectedIds: function () {
            return this.chain()
                .filter(function (language) { return language.get("enabled"); })
                .pluck("id")
                .value();
        },

        getById: function (languageId) {
            return this._map[languageId];
        }
    });

    mat.Parameter = Backbone.Model.extend({
        defaults: function () {
            return {
                value: null,
                name: null
            };
        }
    });

    mat.ParameterList = Backbone.Collection.extend({
        model: mat.Parameter,

        toMap: function () {
            var qs = {};
            this.forEach(function (parameter) {
                var value = parameter.get("value");
                if (value) {
                    qs[parameter.get("name")] = value;
                }
            });
            return qs;
        },

        fromMap: function (map) {
            this.models.forEach(function (parameter) {
                var data = map[parameter.get("name")];
                if (data) {
                    parameter.set("value", data);
                }
            });
        }
    });

    mat.OptionsModel = Backbone.Model.extend({
        defaults: function () {
            return {
                assetPath: null,
                enableTokenPreview: false,
                showOverlays: false,
                previewMode: 2,
                previewSize: 0
            };
        }
    });

    mat.LanguageOptionsView = Backbone.View.extend({
        events: {
            "click .clear-all": "clearAll",
            "click .select-all": "selectAll"
        },

        selectAll: function () { this.updateAll(true); },

        clearAll: function () { this.updateAll(false); },

        updateAll: function (enabled) {
            this.model.forEach(function (language) {
                language.set("enabled", enabled);
            });
        }
    });

    mat.LanguageView = Backbone.View.extend({
        initialize: function () {
            this.dataBind({
                ".language-id": "enabled"
            });
        }
    });

    mat.ParameterView = Backbone.View.extend({
        initialize: function () {
            this.model.set("name", this.$el.find("label").html());
            this.$input = this.$el.find(".param-value");
            this.listenTo(this.model, "change:value", this.setValue);
        },

        getValue: function () {
            return this.$input.val();
        },

        setValue: function () {
            this.$input.val(this.model.get("value"));
        },

        updateModel: function () {
            this.model.set("value", this.getValue());
        }
    });

    mat.TextParameterView = mat.ParameterView.extend({
        events: {
            "keyup input": "keyupHandler"
        },

        keyupHandler: _.debounce(function () {
            this.updateModel();
        }, 1000)
    });

    mat.MenuParameterView = mat.ParameterView.extend({
        events: {
            "change select.param-value": "updateModel"
        }
    });

    mat.BooleanParameterView = mat.ParameterView.extend({
        events: {
            "change input[type=checkbox]": "updateModel"
        },

        getValue: function () {
            return this.$input.prop("checked");
        },

        setValue: function () {
            this.$input.prop("checked", this.model.get("value").toString() == "true");
        }
    });

    mat.ProductParameterView = mat.TextParameterView.extend({
        initialize: function () {

            mat.ProductParameterView.__super__.initialize.apply(this); 

            this.$productTypeSelect = this.$el.find(".product-type-select");
        },

        events: {
            "change .product-type-select": "updateModel",
            "keyup input": "keyupHandler" // TODO inherit this to DRY it up
        },

        getValue: function() {
            var productType = this.$productTypeSelect.val();
            var productId = this.$input.val().trim();
            return productId ? productType + ":" + productId : "";
        },

        setValue: function() {
            var rawValue = this.model.get("value");
            var productType = "pc";
            var value = "";
            if (rawValue) {
                var parts = rawValue.split(":");
                if (parts.length >= 1) {
                    productType = parts[0];

                    if (parts.length >= 2) {
                        value = parts[1];
                    }
                }
            }

            this.$productTypeSelect.val(productType);
            this.$input.val(value);
        }
    });

    mat.PermalinkView = Backbone.View.extend({
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

    mat.OptionsView = Backbone.View.extend({
        initialize: function () {
            this.dataBind({
                "#enableTokenPreview": "enableTokenPreview",
                "#showOverlays": "showOverlays"
            }, true);
        }
    });

    mat.PreviewSizeOptionsView = Backbone.View.extend({
        initialize: function () {
            this.dataBind({
                "#previewSize": "previewSize"
            });
        }
    });

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

})(jQuery);
