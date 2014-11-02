/*jsl:option explicit*/
/* global require, module */

var $ = require("jquery");
var Backbone = require("backbone");
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
