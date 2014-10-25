/*jsl:option explicit*/
/* global _, jQuery */

/// <reference path="../../../jquery/jquery-current.js" />
/// <reference path="../../../ThirdParty/backbone/underscore.js" />
/// <reference path="../../../ThirdParty/skinnyjs/jquery.cookies.js" />
/// <reference path="../../../ThirdParty/skinnyjs/jquery.querystring.js" />

// TODO this is getting complicated enough to refactor into a backbone app

(function ($) {

    var LANGUAGE_COOKIE_NAME = "Merch_asset_tester_lang";
    var PARAMS_COOKIE_NAME = "Merch_asset_tester_params";
    var OPTIONS_COOKIE_NAME = "Merch_asset_tester_options";

    var _assetPath = $.currentQueryString().src;

    function clearContainer() {
        $("#ImageContainer").html("");
    }

    function insertPreview($context) {
        var iframeUrl = new $.Url("/Root/Utility/MerchandisingAssetPreview");
        iframeUrl.queryString.src = _assetPath;
        iframeUrl.queryString.langid = $context.prop("id");
        iframeUrl.queryString.parameters = _currentParamsString;
        iframeUrl.queryString.previewMode = $("#enableTokenPreview").prop("checked") ? 2 : 1;
        iframeUrl.queryString.showOverlays = $("#showOverlays").prop("checked") ? 1 : 0;

        var $header = '<h3>' + $context.prop('name') + '</h3>';

        var $iframe = '<iframe src="' + iframeUrl.toString() + '" scrolling="no" />';

        var $languageContent = $('<div class="image-section"></div>')
          .append($header)
          .append($iframe);

        $("#ImageContainer").append($languageContent);
        $(".language-none").removeAttr('checked');
    }

    function updatePermalink() {
        var url = new $.Url("/Root/Utility/MerchandisingAssetTester");
        url.queryString.src = _assetPath;
        url.queryString.options = $.param(getOptions());
        url.queryString.languages = getSelectedLanguages().join(",");
        url.queryString.parameters = _currentParamsString;
        url.queryString.useqs = 1;

        $(".permalink").attr("href", url.toString());
    }

    function restoreLanguagesFromCookies() {
        var cookieValue = $.cookies.get(LANGUAGE_COOKIE_NAME);
        if (cookieValue) {
            var languages = cookieValue.split(",");

            $.map(languages, function (languagdId) {
                var $langCheckBox = $('#' + languagdId);
                $langCheckBox.prop('checked', true);
            });
        }
    }

    function restoreOptionsFromCookies() {
        var cookieValue = $.cookies.get(OPTIONS_COOKIE_NAME);
        if (cookieValue) {
            $("#enableTokenPreview").prop("checked", cookieValue.enableTokenPreview === "true");
            $("#showOverlays").prop("checked", cookieValue.showOverlays === "true");
            $("#previewSize").val(cookieValue.previewSize || 0);
        }
    }

    function getOptions() {
        return {
                enableTokenPreview: $("#enableTokenPreview").prop("checked"),
                showOverlays: $("#showOverlays").prop("checked"),
                previewSize: parseInt($("#previewSize").val())
            };
    }

    function saveOptionsToCookies(options) {
        $.cookies.set({
            name: OPTIONS_COOKIE_NAME,
            value: options || getOptions(),
            permanent: true
        });
    }

    // Gets or sets a pair of inputs for product selection:
    // * a select for product type (pp or pc)
    // * a text field for product id (int)
    var productFieldVal = function($el, value) {
        var $productType = $("#" + $el.attr("name") + "_product_type");

        if (typeof(value) == "undefined") {
            // get value
            var productType = $productType.val();
            var productId = $el.val().trim();
            return productId ?
                productType + ":" + productId :
                "";
        } else {
            var data = value.split(":");
            if (data.length != 2) {
                data = ["pc", ""];
            }

            $productType.val(data[0]);
            $el.val(data[1]);

            return null;
        }
    };

    // Handle parameters

    var _currentParamsString;

    function getCurrentParamsString() {
        var newParams = {};

        $(".param-field .param-value").each(function (i, el) {
            var $el = $(el);

            var val;
            var type = $el.attr("type");
            if (type == "checkbox") {
                val = $el.prop("checked").toString();
            } else if (type == "text" && $el.hasClass("param-value-product")) {
                val = productFieldVal($el);
            } else {
                val = $el.val().trim();
            }

            if (val) {
                newParams[$el.attr("name")] = val;
            }
        });

        return $.param(newParams);
    }

    var saveParametersToCookies = function(paramsString) {
        var cookieValues = {};
            cookieValues[_assetPath] = paramsString;
            $.cookies.set({
                name: PARAMS_COOKIE_NAME,
                value: cookieValues,
                permanent: true
            });
    };

    // Refreshes the previews if parameters have changed from the current state
    function updateParams(newParams) {
        newParams = newParams || getCurrentParamsString();
        if (newParams != _currentParamsString) {
            _currentParamsString = newParams;

            saveParametersToCookies(newParams);

            updateAllPreviews();
        }
    }

    var restoreParamsFromCookies = function() {
        _currentParamsString = "";

        if (!_currentParamsString) {
            var newParams = $.cookies.get(PARAMS_COOKIE_NAME, _assetPath);
            if (newParams) {
                // Update the text fields
                var params = $.deparam(newParams);
                for (var param in params) {
                    var $field = $(".param-field .param-value[name='" + param + "']");

                    if ($field.hasClass("param-value-product")) {
                        productFieldVal($field, params[param]);
                    } else if ($field.attr("type") == "checkbox") {
                        $field.prop("checked", !!params[param]);
                    } else {
                        $field.val(params[param]);
                    }
                }
            }

            updateParams(newParams);
        }
    };

    var keyupHandler = _.debounce(function () {
        updateParams();
    }, 1000);

    // Trigger a refresh when parameters text field values change 
    $(".param-field input").on("keyup", keyupHandler);
    $(".param-field select").on("change", function () { updateParams(); });
    $(".param-field input[type=checkbox]").on("change", function () { updateParams(); });
    $("#enableTokenPreview").on("change", function() { updateAllPreviews(); });
    $("#showOverlays").on("change", function() { updateAllPreviews(); });
    $("#previewSize").on("change", function () { updatePreviewSize(); });

    // Setup event handlers

    var getSelectedLanguages = function() {
        var languages = [];

        $(".language-id").each(function (id, value) {
            if (value.checked) {
                languages.push($(this).prop("id"));
            }
        });

        return languages;
    };

    var saveLanguagesToCookies = function(languages) {
        $.cookies.set({ name: LANGUAGE_COOKIE_NAME, value: languages.join(",") });
    };

    var updateAllPreviews = function () {
        clearContainer();
        
        var languages = getSelectedLanguages();
        
        // Recreate the previews for all languages
        // TODO: We could optimize by only refreshing the ones that changed
        $.each(languages, function(i, langId) { insertPreview($("#" + langId)); });

        saveLanguagesToCookies(languages);
        saveOptionsToCookies();
        updatePermalink();
    };

    var updatePreviewSize = function() {
        var options = getOptions();

        var maxWidth = options.previewSize;
        $("#ImageContainer").css({"maxWidth": maxWidth > 0 ? maxWidth : "inherit"});

        saveOptionsToCookies(options);
        updatePermalink();
    };

    // When the language selection changes, update the previews to show the selected languages
    $(".language-id").change(function () {
        updateAllPreviews();
    });

    // When the "clear all" button is clicked, clear the language selection and refresh
    $(".clear-all").click(function () {
        clearContainer();
        $(".language-toolbar .language-id").prop("checked", false);
        updateAllPreviews();
    });

    // When the "select all" button is clicked, select all languages and refresh
    $(".select-all").click(function () {
        $(".language-toolbar .language-id").prop("checked", true);
        updateAllPreviews();
    });

    // Initialize
    clearContainer();

    // Used to populate cookies from a permalink querystring.
    // Repopulates cookies and then redirects to remove the querystring.
    var populateCookiesFromQueryString = function() {
        var qs = $.currentQueryString();

        if (qs.useqs != 1) {
            return false;
        }

        if (qs.languages) {
            saveLanguagesToCookies(qs.languages.split(","));
        }
        if (qs.options) {
            saveOptionsToCookies($.deparam(qs.options));
        }
        if (qs.parameters) {
            saveParametersToCookies(qs.parameters);
        }

        // Now that cookies have been repopulated, redirect
        // to remove the querystring.
        var url = new $.Url(document.location.href);
        delete url.queryString.useqs;
        delete url.queryString.languages;
        delete url.queryString.options;
        delete url.queryString.parameters;

        document.location = url.toString();

        return true;
    };
    
    // Initialize the params string when the page starts
    $(document).ready(function() {
        if (populateCookiesFromQueryString()) {
            return;
        }

        restoreOptionsFromCookies();
        restoreLanguagesFromCookies();
        restoreParamsFromCookies();

        updatePreviewSize();
        updateAllPreviews();
    });

})(jQuery);
