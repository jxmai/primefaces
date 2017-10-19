/* Primefaces Extensions */
(function () {
    var original_gotoToday = $.datepicker._gotoToday;

    $.datepicker._gotoToday = function (id) {
        var target = $(id),
                inst = this._getInst(target[0]);

        original_gotoToday.call(this, id);
        this._selectDate(id, this._formatDate(inst, inst.selectedDay, inst.drawMonth, inst.drawYear));
    };

    $.datepicker._attachHandlers = function (inst) {
        var stepMonths = this._get(inst, "stepMonths"),
                id = "#" + inst.id.replace(/\\\\/g, "\\");
        inst.dpDiv.find("[data-handler]").map(function () {
            var handler = {
                prev: function () {
                    $.datepicker._adjustDate(id, -stepMonths, "M");
                    this.updateDatePickerPosition(inst);
                },
                next: function () {
                    $.datepicker._adjustDate(id, +stepMonths, "M");
                    this.updateDatePickerPosition(inst);
                },
                hide: function () {
                    $.datepicker._hideDatepicker();
                },
                today: function () {
                    $.datepicker._gotoToday(id);
                },
                selectDay: function () {
                    $.datepicker._selectDay(id, +this.getAttribute("data-month"), +this.getAttribute("data-year"), this);
                    return false;
                },
                selectMonth: function () {
                    $.datepicker._selectMonthYear(id, this, "M");
                    return false;
                },
                selectYear: function () {
                    $.datepicker._selectMonthYear(id, this, "Y");
                    return false;
                }
            };
            $(this).bind(this.getAttribute("data-event"), handler[this.getAttribute("data-handler")]);

            this.updateDatePickerPosition = function (inst) {
                if (!$.datepicker._pos) { // position below input
                    $.datepicker._pos = $.datepicker._findPos(inst.input[0]);
                    $.datepicker._pos[1] += inst.input[0].offsetHeight; // add the height
                }

                var offset = {left: $.datepicker._pos[0], top: $.datepicker._pos[1]};
                $.datepicker._pos = null;
                var isFixed = false;
                $(inst.input[0]).parents().each(function () {
                    isFixed |= $(this).css("position") === "fixed";
                    return !isFixed;
                });
                var checkedOffset = $.datepicker._checkOffset(inst, offset, isFixed);
                inst.dpDiv.css({top: checkedOffset.top + "px"});
            };
        });
    };

    $.datepicker._generateMonthYearHeader = function (inst, drawMonth, drawYear, minDate, maxDate, secondary, monthNames, monthNamesShort) {

        var inMinYear, inMaxYear, month, years, thisYear, determineYear, year, endYear,
                changeMonth = this._get(inst, "changeMonth"),
                changeYear = this._get(inst, "changeYear"),
                showMonthAfterYear = this._get(inst, "showMonthAfterYear"),
                html = "<div class='ui-datepicker-title'>",
                monthHtml = "";

        // month selection
        if (secondary || !changeMonth) {
            monthHtml += "<span class='ui-datepicker-month' aria-label='select month'>" + monthNames[drawMonth] + "</span>";
        } else {
            inMinYear = (minDate && minDate.getFullYear() === drawYear);
            inMaxYear = (maxDate && maxDate.getFullYear() === drawYear);
            monthHtml += "<select class='ui-datepicker-month' data-handler='selectMonth' data-event='change' aria-label='select month'>";
            for (month = 0; month < 12; month++) {
                if ((!inMinYear || month >= minDate.getMonth()) && (!inMaxYear || month <= maxDate.getMonth())) {
                    monthHtml += "<option value='" + month + "'" +
                            (month === drawMonth ? " selected='selected'" : "") +
                            ">" + monthNamesShort[month] + "</option>";
                }
            }
            monthHtml += "</select>";
        }

        if (!showMonthAfterYear) {
            html += monthHtml + (secondary || !(changeMonth && changeYear) ? "&#xa0;" : "");
        }

        // year selection
        if (!inst.yearshtml) {
            inst.yearshtml = "";
            if (secondary || !changeYear) {
                html += "<span class='ui-datepicker-year' aria-label='select year'>" + drawYear + "</span>";
            } else {
                // determine range of years to display
                years = this._get(inst, "yearRange").split(":");
                thisYear = new Date().getFullYear();
                determineYear = function (value) {
                    var year = (value.match(/c[+\-].*/) ? drawYear + parseInt(value.substring(1), 10) :
                            (value.match(/[+\-].*/) ? thisYear + parseInt(value, 10) :
                                    parseInt(value, 10)));
                    return (isNaN(year) ? thisYear : year);
                };
                year = determineYear(years[0]);
                endYear = Math.max(year, determineYear(years[1] || ""));
                year = (minDate ? Math.max(year, minDate.getFullYear()) : year);
                endYear = (maxDate ? Math.min(endYear, maxDate.getFullYear()) : endYear);
                inst.yearshtml += "<select class='ui-datepicker-year' data-handler='selectYear' data-event='change' aria-label='select year'>";
                for (; year <= endYear; year++) {
                    inst.yearshtml += "<option value='" + year + "'" +
                            (year === drawYear ? " selected='selected'" : "") +
                            ">" + year + "</option>";
                }
                inst.yearshtml += "</select>";

                html += inst.yearshtml;
                inst.yearshtml = null;
            }
        }

        html += this._get(inst, "yearSuffix");
        if (showMonthAfterYear) {
            html += (secondary || !(changeMonth && changeYear) ? "&#xa0;" : "") + monthHtml;
        }
        html += "</div>"; // Close datepicker_header
        return html;
    };
})();

(function () {
    $.timepicker._updateDateTime = function (dp_inst) {
        dp_inst = this.inst || dp_inst;
        var dtTmp = (dp_inst.currentYear > 0?
                        new Date(dp_inst.currentYear, dp_inst.currentMonth, dp_inst.currentDay) :
                        new Date(dp_inst.selectedYear, dp_inst.selectedMonth, dp_inst.selectedDay)),
            dt = $.datepicker._daylightSavingAdjust(dtTmp),
            //dt = $.datepicker._daylightSavingAdjust(new Date(dp_inst.selectedYear, dp_inst.selectedMonth, dp_inst.selectedDay)),
            //dt = $.datepicker._daylightSavingAdjust(new Date(dp_inst.currentYear, dp_inst.currentMonth, dp_inst.currentDay)),
            dateFmt = $.datepicker._get(dp_inst, 'dateFormat'),
            formatCfg = $.datepicker._getFormatConfig(dp_inst),
            timeAvailable = dt !== null && this.timeDefined;
        this.formattedDate = $.datepicker.formatDate(dateFmt, (dt === null ? new Date() : dt), formatCfg);
        var formattedDateTime = this.formattedDate;

        // if a slider was changed but datepicker doesn't have a value yet, set it
        var originalValue = dp_inst.lastVal;
        if (originalValue === "") {
            dp_inst.currentYear = dp_inst.selectedYear;
            dp_inst.currentMonth = dp_inst.selectedMonth;
            dp_inst.currentDay = dp_inst.selectedDay;
        }

        /*
        * remove following lines to force every changes in date picker to change the input value
        * Bug descriptions: when an input field has a default value, and click on the field to pop up the date picker.
        * If the user manually empty the value in the input field, the date picker will never change selected value.
        */
        //if (dp_inst.lastVal !== undefined && (dp_inst.lastVal.length > 0 && this.$input.val().length === 0)) {
        //	return;
        //}

        if (this._defaults.timeOnly === true && this._defaults.timeOnlyShowDate === false) {
            formattedDateTime = this.formattedTime;
        } else if ((this._defaults.timeOnly !== true && (this._defaults.alwaysSetTime || timeAvailable)) || (this._defaults.timeOnly === true && this._defaults.timeOnlyShowDate === true)) {
            formattedDateTime += this._defaults.separator + this.formattedTime + this._defaults.timeSuffix;
        }

        this.formattedDateTime = formattedDateTime;

        if (!this._defaults.showTimepicker) {
            this.$input.val(this.formattedDate);
        } else if (this.$altInput && this._defaults.timeOnly === false && this._defaults.altFieldTimeOnly === true) {
            this.$altInput.val(this.formattedTime);
            this.$input.val(this.formattedDate);
        } else if (this.$altInput) {
            this.$input.val(formattedDateTime);
            var altFormattedDateTime = '',
                altSeparator = this._defaults.altSeparator !== null ? this._defaults.altSeparator : this._defaults.separator,
                altTimeSuffix = this._defaults.altTimeSuffix !== null ? this._defaults.altTimeSuffix : this._defaults.timeSuffix;

            if (!this._defaults.timeOnly) {
                if (this._defaults.altFormat) {
                    altFormattedDateTime = $.datepicker.formatDate(this._defaults.altFormat, (dt === null ? new Date() : dt), formatCfg);
                }
                else {
                    altFormattedDateTime = this.formattedDate;
                }

                if (altFormattedDateTime) {
                    altFormattedDateTime += altSeparator;
                }
            }

            if (this._defaults.altTimeFormat !== null) {
                altFormattedDateTime += $.datepicker.formatTime(this._defaults.altTimeFormat, this, this._defaults) + altTimeSuffix;
            }
            else {
                altFormattedDateTime += this.formattedTime + altTimeSuffix;
            }
            this.$altInput.val(altFormattedDateTime);
        } else {
            this.$input.val(formattedDateTime);
        }

        if (originalValue != formattedDateTime) {
            this.$input.trigger("change"); // PrimeFaces https://github.com/primefaces/primefaces/issues/2811
        }
    }
})();




(function () {
    $.extend($.ui.keyCode, {
        NUMPAD_ENTER: 108
    });

    $.fn.extend({
        focus: (function (orig) {
            return function (delay, fn) {
                return typeof delay === "number" ?
                        this.each(function () {
                            var elem = this;
                            setTimeout(function () {
                                $(elem).focus();
                                if (fn) {
                                    fn.call(elem);
                                }
                            }, delay);
                        }) :
                        orig.apply(this, arguments);
            };
        })($.fn.focus),

        disableSelection: (function () {
            var eventType = "onselectstart" in document.createElement("div") ?
                    "selectstart" :
                    "mousedown";

            return function () {
                return this.bind(eventType + ".ui-disableSelection", function (event) {
                    event.preventDefault();
                });
            };
        })(),

        enableSelection: function () {
            return this.unbind(".ui-disableSelection");
        },

        zIndex: function (zIndex) {
            if (zIndex !== undefined) {
                return this.css("zIndex", zIndex);
            }

            if (this.length) {
                var elem = $(this[ 0 ]), position, value;
                while (elem.length && elem[ 0 ] !== document) {
                    // Ignore z-index if position is set to a value where z-index is ignored by the browser
                    // This makes behavior of this function consistent across browsers
                    // WebKit always returns auto if the element is positioned
                    position = elem.css("position");
                    if (position === "absolute" || position === "relative" || position === "fixed") {
                        // IE returns 0 when zIndex is not specified
                        // other browsers return a string
                        // we ignore the case of nested elements with an explicit value of 0
                        // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
                        value = parseInt(elem.css("zIndex"), 10);
                        if (!isNaN(value) && value !== 0) {
                            return value;
                        }
                    }
                    elem = elem.parent();
                }
            }

            return 0;
        }
    });
})();




