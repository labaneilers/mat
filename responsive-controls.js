/// <reference path="../jquery/jquery-current.js" />
/// <reference path="../thirdparty/skinnyjs/pointy.gestures.js" />
/// <reference path="../common/core/vp.browser.js" />

$(function () {

    /*
    * initializer for controls
    */
    $("body").on("initializeControl", "*", function (event) {

        event.stopPropagation();

        // recurse through this element and its children, looking for any control types we know about, and initialize them
        $(this).children().addBack().each(function () {
            var $this = $(this);

            // stylized selects
            if ($this.is(".stylized-select")) {
                if (!($this.parent().hasClass("stylized-select-container"))) {
                    var $containerClass = $this.attr("data-container-class") || "";
                    $this.wrap("<span class='stylized-select-container " + $containerClass + "' />");
                }
                if (!($this.next().hasClass("stylized-select-label"))) {
                    $this.after("<label class='stylized-select-label' for='" + $this.attr("name") + "'>" + $this.find("option:selected").text() + "</label>");
                }
            }

            // tab containers
            if ($this.is(".tabs")) {
                $this.children(".tabs-headers").each(function () {
                    var $thisHeaders = $(this);
                    var selectedTabId = "null";

                    // see if a tab is selected
                    $thisHeaders.find("input[type=radio]").each(function () {
                        if ($(this).prop("checked")) {
                            selectedTabId = $(this).val();
                        }
                    });
                    // if no tab is selected, select the first one
                    if (selectedTabId == "null") {
                        var $firstTab = $($thisHeaders.find("input:first-of-type")[0]);
                        $firstTab.prop("checked", true);
                        selectedTabId = $firstTab.val();
                    }
                    $(selectedTabId).addClass("tab-selected");

                    // wrap the inputs (and their labels) 
                    $thisHeaders.children("input").each(function () {
                        var $thisInput = $(this);
                        // wrap this input in an element with class "tabs-headers-header"
                        $thisInput.wrap("<span class='tabs-headers-header'></span>");
                        // find the label for this input, and put it inside the wrapper at the end
                        $("label[for='" + $thisInput.attr("id") + "']").appendTo($thisInput.parent());
                    });
                });
            }

            // polyfills for radios/checkboxes and selects in IE7 and IE8, which don't support CSS :checked or :disabled
            if (vp.browser.isIE && vp.browser.ver < 9) {

                if ($this.is(".stylized-checkbox :checkbox, .stylized-radio :radio, fieldset.buttonbar :checkbox, fieldset.buttonbar :radio, .tabs-headers :radio, .stylized-select")) {
                    if ($this.is(":checked")) {
                        $this.addClass("checked");
                    } else {
                        $this.removeClass("checked");
                    }
                    if ($this.is(":disabled")) {
                        $this.addClass("disabled");
                    } else {
                        $this.removeClass("disabled");
                    }
                }
            }

            // option set
            if ($this.is(".option-set-option .stylized-radio-input, .option-set-option .stylized-checkbox-input") && ($this.parents(".option-set-contents").length < 1)) {
                var $thisOptionSetWrapper = $this.closest(".option-set-option-wrapper");
                if ($this.is(":checked")) {
                    $thisOptionSetWrapper.addClass("checked");
                } else {
                    $thisOptionSetWrapper.removeClass("checked");
                }
                if ($this.is(":disabled")) {
                    $thisOptionSetWrapper.addClass("disabled");
                } else {
                    $thisOptionSetWrapper.removeClass("disabled");
                }
            }
        });

    });


    /*
    * stylized selects
    */

    // initialize
    $(".stylized-select").each(function () {
        $(this).trigger("initializeControl");
    });

    // change handler to keep label in sync with value
    $("body").on("change", ".stylized-select", function () {
        var chosenContents;
        var chosenVal = $(this).val();
        $(this).find("option").each(function () {
            if ($(this).attr("value") == chosenVal) {
                chosenContents = $(this).html();
            }
        });
        $(this).parent().find(".stylized-select-label").html(chosenContents);
    });

    // in IE8 and IE9 if you click on the padding of a select you only focus
    // so we change the widths on dom ready to remove the padding
    if (vp.browser.isIE && (vp.browser.ver === 8 || vp.browser.ver === 9)) {
        $("body").on("mousedown", ".stylized-select", function () {
            $(this).css('width', $(this).outerWidth() + 'px').css('border-width', '0');
        });
    }

    /*
    * collapsibles/accordions
    */
    $("body").on("click", ".collapsible-header", function () {
        var $parent = $(this).parent();
        if ($parent.hasClass("collapsible-open")) {
            // we have to add inline CSS of display:block to make the slideUp animation work properly
            $parent.children(".collapsible-content").css("display", "block").slideUp();
            $parent.removeClass("collapsible-open");
        }
        else {
            $parent.children(".collapsible-content").slideDown();
            $parent.addClass("collapsible-open");
        }

        // if this is part of an accordion, and that accordion doesn't allow multiple nodes to be open, close the other nodes
        if (($parent.parent().hasClass("accordion")) && !($parent.parent().hasClass("accordion-multiple"))) {
            $parent.siblings().removeClass("collapsible-open").children(".collapsible-content").slideUp();
        }
    });

    /*
    * tab containers
    */

    // initialize
    $(".tabs").trigger("initializeControl");

    // add event handlers to the tab headers
    function setTabsContent(elm) {
        var $this = $(elm);

        // get the value of this radio button, which is equal to a hash character plus the id of the tab's associated content element
        var $tabVal = $($this.val());
        // find the siblings of that tab, and hide them
        $tabVal.siblings().removeClass("tab-selected");
        // show this tab content 
        $tabVal.addClass("tab-selected");

        if ($this.closest(".tabs").hasClass("tabs-accordionized-ie8")) {
            setTabHeadersAccordionizedIE8($(elm));
        }

        // IE8's polyfill needs class "checked" on the selected radio. Remove that class from the other radios in this radio group
        if (vp.browser.isIE && vp.browser.ver < 9) {
            var chosenName = $this.attr("name");
            var chosenValue = $this.attr("value");
            $("input[name='" + chosenName + "']").each(function () {
                var $thisRadioInSameGroup = $(this);
                if ($thisRadioInSameGroup.attr("value") == chosenValue) {
                    $thisRadioInSameGroup.addClass("checked");
                } else {
                    $thisRadioInSameGroup.removeClass("checked");
                }
            });
        }
    }
    // IE8 has its own custom version of the accordionizing, so we need to set the selected tab to display as open
    function setTabHeadersAccordionizedIE8($elm)
    {
        var $this = $elm;
        var thisId = $this.attr("id");
            
        $this.closest(".tabs").children(".tabs-contents").children(".tabs-headers-header").each(function () {
            var $thisHeader = $(this);
            if ($thisHeader.children("label").attr("for") == thisId) {
                $thisHeader.addClass("tab-header-open");
            }
            else {
                $thisHeader.removeClass("tab-header-open");
            }

        });
    }

    $("body").on("change", ".tabs-headers > :radio, .tabs-headers-header > :radio", function () {
        setTabsContent(this);
    });

    $("body").on("accordionizeTab", "*", function (event) {
        event.stopPropagation();
        var $this = $(this);
        
        if ($this.is(".tabs")) {
            var $thisTabs = $(this);

            // Get biggest width among descendents
            var getMaxWidth = function (e) {
                return Math.max.apply(Math,
                    $thisTabs.find($(e))
                        .map(function () { return $(this).width(); })
                        .get());
            };

            // if accordionized tab containers have enough room to display normally, un-accordionize them
            if ($thisTabs.hasClass("tabs-accordionized") && ($thisTabs.children(".tabs-headers").width() <= getMaxWidth(".tabs-contents"))) {
                $thisTabs.removeClass("tabs-accordionized");

                if ($("body").hasClass("ie8"))
                {
                    $thisTabs.removeClass("tabs-accordionized-ie8");
                    $thisTabs.children(".tabs-headers").append($thisTabs.children(".tabs-headers").find(".tabs-headers-header"));
                } else {
                    $thisTabs.find(".tabs-headers").append($thisTabs.find(".tabs-headers-header"));
                }
            }

            // if a tab container doesn't have enough room, accordionize it, unless it has class "tabs-always"
            if (!($thisTabs.hasClass("tabs-always")) && ($thisTabs.children(".tabs-headers").width() > getMaxWidth(".tabs-contents")))
            {
                $thisTabs.addClass("tabs-accordionized");

                // Create tab headers inside the tabs contents zone. 
                // For most browsers: move the header's position in the DOM tree.
                // In IE8, doing this makes them unclickable due to a bug, so instead clone just the label.
                if ($("body").hasClass("ie8"))
                {
                    $thisTabs.addClass("tabs-accordionized-ie8");
                    // copy the label from each header and place it before the element whose id that matches the value of this header's input.
                    // if we've already done this (and thus are "pre-accordionized"), don't do so again.
                    if (!$thisTabs.hasClass("tabs-pre-accordionized")) {
                        $thisTabs.children(".tabs-headers").find(".tabs-headers-header").each(function () {
                            var $thisHeader = $(this);
                            var $thisHeaderInput = $thisHeader.children("input");
                            var $thisHeaderLabelClone = $thisHeader.find("label").clone();
                            $thisHeaderLabelClone.insertBefore($($thisHeaderInput.val()));
                            $thisHeaderLabelClone.wrap("<div class='tabs-headers-header'></div>");

                            if ($thisHeaderInput.is(":disabled"))
                            {
                                $thisHeaderLabelClone.parent().addClass("tabs-headers-header-disabled");
                            }

                        });
                        $thisTabs.addClass("tabs-pre-accordionized");
                    }

                    // set the selected tab to display as open
                    setTabHeadersAccordionizedIE8($thisTabs.children(".tabs-headers").find(":radio:checked"));
                }
                else
                {
                    // move this header to be before the element whose id that matches the value of this header's in
                    $thisTabs.children(".tabs-headers").find(".tabs-headers-header").each(function () {
                        var $thisHeader = $(this);
                        $thisHeader.insertBefore($($thisHeader.children("input").val()));
                    });
                }
            }
        }
    });
    
    // convert tab container to accordion look as necessary
    function accordionizeTabs()
    {
        $(".tabs").each(function () {
            $(this).trigger("accordionizeTab");
        });
    }
    $("body").ready(accordionizeTabs);
    $(window).resize(accordionizeTabs);


    /*
    * Radios and Checkboxes
    * (must come after the tab container code so that it also applies to the radio buttons inside tab containers)
    */

    // IE 7 and 8 don't support the :checked or :disabled CSS properties, so we simulate them by adding/removing CSS classes instead
    if (vp.browser.isIE && vp.browser.ver < 9) {
        // initialize the controls
        $(".stylized-checkbox :checkbox, .stylized-radio :radio, fieldset.buttonbar :checkbox, fieldset.buttonbar :radio, .tabs :radio").trigger("initializeControl");
    }
    // change handlers
    $("body").on("change", ".stylized-checkbox :checkbox, fieldset.buttonbar :checkbox, .stylized-select", function () {
        if (this.checked) {
            $(this).addClass("checked");
        } else {
            $(this).removeClass("checked");
        }
    });
    $("body").on("change", "fieldset.buttonbar :radio, .tabs :radio", function () {
        var $thisRadio = $(this);
        var chosenName = $thisRadio.attr("name");
        var chosenValue = $thisRadio.attr("value");
        $("input[name='" + chosenName + "']").each(function () {
            var $thisRadioInSameGroup = $(this);
            if ($thisRadioInSameGroup.attr("value") == chosenValue) {
                $thisRadioInSameGroup.addClass("checked");
            } else {
                $thisRadioInSameGroup.removeClass("checked");
            }
        });
    });
    
    // extend jQuery's .prop() method so that it also sets the CSS class when disabling/enabling a control
    var originalJQueryPropMethod = $.fn.prop;
    $.fn.prop = function () {
        var $this = $(this);

        // original behavior - use function.apply to preserve context
        var ret = originalJQueryPropMethod.apply(this, arguments);

        // if this is a setter, and the property is "disabled" or "checked", set a CSS class 
        if ((arguments[1] !== null && arguments[1] !== undefined) && (arguments[0] == "disabled" || arguments[0] == "checked")) {
            // IE7-8 polyfill for lack of CSS :checked or :disabled support
            if (vp.browser.isIE && vp.browser.ver < 9) {
                if (arguments[1]) {
                    $this.addClass(arguments[0]);
                }
                else {
                    $this.removeClass(arguments[0]);
                }
            }
            // if this is an input for an option set, set the same class on the closest option set wrapper
            if ($this.is(".option-set .stylized-radio-input, .option-set .stylized-checkbox-input") && ($this.parents(".option-set-contents").length < 1))
            {
                var $thisOptionSetOption = $this.closest(".option-set-option");
                var $thisOptionSetWrapper = $this.closest(".option-set-option-wrapper");
                if (arguments[1]) {
                    $thisOptionSetOption.addClass(arguments[0]);
                    $thisOptionSetWrapper.addClass(arguments[0]);
                }
                else {
                    $thisOptionSetOption.removeClass(arguments[0]);
                    $thisOptionSetWrapper.removeClass(arguments[0]);
                }

                
            }
        }

        // if this is a radio button in a tab header that has been checked, change the tabs content to match
        if ((arguments[1] !== null && arguments[1] !== undefined) && (arguments[0] == "checked") && ($this.parent().hasClass("tabs-headers-header"))) {
            setTabsContent(this);
        }

        return ret;
    };

    /*
    * option set
    */

    // initialize
    $(".option-set .stylized-radio-input, .option-set .stylized-checkbox-input").trigger("initializeControl");

    // click handler for option wrappers
    $("body").on("click", ".option-set-option-wrapper", function () {
        var $this = $(this);
        var $thisOptionInput = $this.find(".option-set-option input.stylized-radio-input");

        if (($thisOptionInput.length > 0) && !($thisOptionInput.is(":disabled"))) {
            // radios
            var optWasChecked = $thisOptionInput.prop("checked");

            $this.closest(".option-set").find(".option-set-option input").each(function () {
                $(this).prop("checked", false);
            });
            $thisOptionInput.prop("checked", true);
            if (!optWasChecked) {
                $thisOptionInput.trigger("change");
            }
        }
    });
    // change handler for options
    $("body").on("change", ".option-set .stylized-radio-input, .option-set .stylized-checkbox-input", function () {
        var $this = $(this);

        // only pay attention to the top-level inputs, not the ones in the contents
        if ($this.parents(".option-set-contents").length < 1)
        {
            var $thisOptionSetOption = $this.closest(".option-set-option");
            var $thisOptionSetWrapper = $this.closest(".option-set-option-wrapper");
            if ($this.is(":checked")) {
                $thisOptionSetOption.addClass("checked");
                $thisOptionSetWrapper.addClass("checked");
            } else {
                $thisOptionSetOption.removeClass("checked");
                $thisOptionSetWrapper.removeClass("checked");
            }

            // for radios, uncheck all the other options
            if ($this.is(".stylized-radio-input")) {
                $(this).closest(".option-set").find(".stylized-radio-input").each(function () {
                    var $this = $(this);
                    var $thisOptionSetOption = $this.closest(".option-set-option");
                    var $thisOptionSetWrapper = $this.closest(".option-set-option-wrapper");
                    if (!($this.is(":checked"))) {
                        $thisOptionSetOption.removeClass("checked");
                        $thisOptionSetWrapper.removeClass("checked");
                    }
                });
            }
        }
    });

    });

