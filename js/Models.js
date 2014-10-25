/*jsl:option explicit*/
/* global _, jQuery, Backbone */

"use strict";

var mat = {};

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
