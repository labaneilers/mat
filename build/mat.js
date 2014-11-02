require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/*jsl:option explicit*/
/* global require, module */

var ParameterView = require("./ParameterView");

var BooleanParameterView = ParameterView.extend({
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

module.exports = BooleanParameterView;
},{"./ParameterView":7}],2:[function(require,module,exports){
(function (global){
/*jsl:option explicit*/
/* global require, module */

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
Backbone.$ = $;

var LanguageOptionsView = Backbone.View.extend({

    el: ".language-toolbar-options",

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

module.exports = LanguageOptionsView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
(function (global){
/*jsl:option explicit*/
/* global require, module */

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Models":5,"./backbone.databind":14}],4:[function(require,module,exports){
/*jsl:option explicit*/
/* global require, module */

var ParameterView = require("./ParameterView");

var MenuParameterView = ParameterView.extend({
        events: {
            "change select.param-value": "updateModel"
        }
    });

module.exports = MenuParameterView;
},{"./ParameterView":7}],5:[function(require,module,exports){
(function (global){
/*jsl:option explicit*/
/* global require, module */

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
Backbone.$ = $;

var Models = {};

Models.Language = Backbone.Model.extend({
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

Models.LanguageList = Backbone.Collection.extend({
    model: Models.Language,

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

Models.Parameter = Backbone.Model.extend({
    defaults: function () {
        return {
            value: null,
            name: null
        };
    }
});

Models.ParameterList = Backbone.Collection.extend({
    model: Models.Parameter,

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

Models.OptionsModel = Backbone.Model.extend({
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

module.exports = Models;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
(function (global){
/*jsl:option explicit*/
/* global require, module */

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./backbone.databind":14}],7:[function(require,module,exports){
(function (global){
/*jsl:option explicit*/
/* global require, module */

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
Backbone.$ = $;

var ParameterView = Backbone.View.extend({
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

module.exports = ParameterView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(require,module,exports){
(function (global){
/*jsl:option explicit*/
/* global require, module */

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
Backbone.$ = $;

var BooleanParameterView = require("./BooleanParameterView");
var ProductParameterView = require("./ProductParameterView");
var MenuParameterView = require("./MenuParameterView");
var TextParameterView = require("./TextParameterView");
var Models = require("./Models");

var createAllParameterViews = function () {
    return $(".param-field").map(function (index, el) {
        var $input = $(el).find(".param-value");
        var type = $input.attr("type");
        var Ctor;

        if (type == "checkbox") {
            Ctor = BooleanParameterView;
        } else if (type == "text" && $input.hasClass("param-value-product")) {
            Ctor = ProductParameterView;
        } else if ($input.prop("tagName") == "SELECT") {
            Ctor = MenuParameterView;
        } else {
            Ctor = TextParameterView;
        }

        return new Ctor({ el: el, model: new Models.Parameter() });
    });
};

module.exports = createAllParameterViews;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./BooleanParameterView":1,"./MenuParameterView":4,"./Models":5,"./ProductParameterView":12,"./TextParameterView":13}],9:[function(require,module,exports){
(function (global){
/*jsl:option explicit*/
/* global require, module */

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],10:[function(require,module,exports){
(function (global){
/*jsl:option explicit*/
/* global require, module */

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./backbone.databind":14}],11:[function(require,module,exports){
(function (global){
/*jsl:option explicit*/
/* global require, module */

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
Backbone.$ = $;

var PreviewView = Backbone.View.extend({

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

module.exports = PreviewView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(require,module,exports){
(function (global){
/*jsl:option explicit*/
/* global require, module */

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
Backbone.$ = $;

var TextParameterView = require("./TextParameterView");

var ProductParameterView = TextParameterView.extend({
    initialize: function () {

        ProductParameterView.__super__.initialize.apply(this); 

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

module.exports = ProductParameterView;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./TextParameterView":13}],13:[function(require,module,exports){
(function (global){
/*jsl:option explicit*/
/* global require, module */

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var ParameterView = require("./ParameterView");

var TextParameterView = ParameterView.extend({
    events: {
        "keyup input": "keyupHandler"
    },

    keyupHandler: _.debounce(function () {
        this.updateModel();
    }, 1000)
});

module.exports = TextParameterView;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ParameterView":7}],14:[function(require,module,exports){
(function (global){
/*jsl:option explicit*/
/* global require, module */

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
Backbone.$ = $;

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

// Bind key value pairs where the key is a DOM element selector, 
// and the value is the name of the property in the view's model.
// If initializeDOM is true, then the DOM element is initialized from the model immediately.
module.exports = function (view, map, initializeDOM) {
    for (var key in map) {
        var $el = key.indexOf("#") === 0 ? $(key) : view.$el.find(key);
        dataBindEl($el, view.model, map[key], initializeDOM);
    }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"AppView":[function(require,module,exports){
(function (global){
/*jsl:option explicit*/
/* global require */

var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
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



}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./LanguageOptionsView":2,"./LanguageView":3,"./Models":5,"./OptionsView":6,"./ParameterViewFactory":8,"./PermalinkView":9,"./PreviewSizeOptionsView":10,"./PreviewView":11}]},{},["AppView"]);
