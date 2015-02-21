// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ Gauge D3.js                                                                                                                            │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2015 Daisuke Tanaka (https://github.com/tanaka0323)                                                                        │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                                                                                        │ \\
// └────────────────────────────────────────────────────────────────────┘ \\

GaugeD3 = function(_option) {
    'use strict';

    var self = this;
    var version = "1.0.0";

    var parentNode = null;

    var _CRITERIA_R = 112;

    // d3 variables
    var d3var = {
        svg: null,
        center: null,
        arc: null,
        arc_bg: null,
        arc_level: null,
        value: null,
        label: null,
        min: null,
        max: null
    };

    var startArcAngle, endArcAngle, curArcAngle = 0;

    // default optionuration
    var default_option = {
        // type string : this is container element id
        bindto: '',

        title: {
            // type string : gauge title
            text: '',
            // type string : color of gauge title
            color: '#999999'
        },

        value: {
            // type float : value gauge is showing
            val: 0,
            // type string : color of label showing current value
            color: '#010101',
            // type float : min value
            min: 0,
            // type float : max value
            max: 100,
            // type bool : convert large numbers for min, max, value to human friendly (e.g. 1234567 -> 1.23M)
            humanFriendly: false,
            // type int : number of decimal places for our human friendly number to contain
            humanFriendlyDecimal: 0,
            // type bool : hide value text
            hide: false,
            // type bool : hide min and max values
            hideMinMax: false,
            // type bool : convert large numbers for min, max, value to human friendly (e.g. 1234567 -> 1.23M)
            humanFriendlyMinMax: false,
            // type int : number of digits after floating point
            decimals: 0,
            // type bool : formats numbers with commas where appropriate when humanFriendly is false only
            formatNumber: false,
            // type string : css class
            class: ''
        },

        gauge: {
            // type float : width of the gauge element
            widthScale: 1.0,
            // type string : background color of gauge element
            color: '#edebeb',
            // type bool : whether to use gradual color change for value, or sector-based
            noGradient: false,
            // type int : gauge type (half, pie, donut)
            type: 'half',
            // type bool : whether gauge size should follow changes in container element size
            relativeSize: false
        },

        label: {
            // type string : text to show below value
            text: '',
            // type string : color of label showing label under value
            color: '#edebeb',
            // type string : css class
            class: ''
        },

        level: {
            // type string[]: colors of indicator, from lower to upper, in RGB format
            colors: ['#a9d70b', '#f9c802', '#ff0000'],
            // type bool : animate level number change
            counter: false,
            // type [] of objects : number of digits after floating point
            customSectors : [],
        },

        animation: {
            // type int : length of initial animation
            startTime: 700,
            // type string : type of initial animation (linear, quad, cubic, sin, exp, circle, elastic, back, bounce) + -in -out -in-out -out-in
            startType: 'linear',
            // type int : length of refresh animation
            refreshTime: 700,
            // type string : type of refresh animation (linear, quad, cubic, sin, exp, circle, elastic, back, bounce) + -in -out -in-out -out-in
            refreshType: 'cubic-in'
        }
    };

    var option = default_option;

    // Initialize
    var ret = (function(opt) {
        if (_.isNull(opt) || _.isUndefined(opt)) {
            console.error('GaugeD3: Make sure to pass options to the constructor!');
            return false;
        }
        if (_.isNull(opt.bindto) || _.isUndefined(opt.bindto)) {
            console.error('GaugeD3: No element with id : %s found', option.bindto);
            return false;
        }

        parentNode = document.getElementById(opt.bindto);
        if (!parentNode) {
            console.error('GaugeD3: No element with id : %s found', opt.bindto);
            return false;
        }

        setOption(_.merge(default_option, opt));

        createD3();

        initialTransition();

    }(_option));

    if (ret === false)
        return undefined;

    function setOption(opt) {
        option.bindto = opt.bindto;
        option.title.text = opt.title.text;
        option.title.color = opt.title.color;

        if (opt.value.min > opt.value.max) {
            var tmp = opt.value.max;
            opt.value.max = opt.value.min;
            opt.value.min = tmp;
        }
        if (opt.value.min === opt.value.max)
            opt.value.max = opt.value.min+100;

        option.value.val = Number(opt.value.val);
        option.value.color = opt.value.color;
        option.value.min = Number(opt.value.min);
        option.value.max = Number(opt.value.max);
        option.value.humanFriendly = opt.value.humanFriendly;
        option.value.humanFriendlyDecimal = Number(opt.value.humanFriendlyDecimal);
        option.value.hide = opt.value.hide;
        option.value.hideMinMax = opt.value.hideMinMax;
        option.value.humanFriendlyMinMax = opt.value.humanFriendlyMinMax;
        option.value.decimals = Number(opt.value.decimals);
        option.value.formatNumber = opt.value.formatNumber;
        option.value.class = opt.value.class;

        option.gauge.widthScale = Math.max(0.0, Math.min(Number(opt.gauge.widthScale), 1.0));
        option.gauge.color = opt.gauge.color;
        option.gauge.noGradient = opt.gauge.noGradient;
        option.gauge.type = opt.gauge.type;
        option.gauge.relativeSize = opt.gauge.relativeSize;

        option.label.text = opt.label.text;
        option.label.color = opt.label.color;
        option.label.class = opt.label.class;

        option.level.colors = opt.level.colors;
        option.level.counter = opt.level.counter;
        option.level.customSectors = opt.level.customSectors;

        option.animation.startTime = Number(opt.animation.startTime);
        option.animation.startType = opt.animation.startType;
        option.animation.refreshTime = Number(opt.animation.refreshTime);
        option.animation.refreshType = opt.animation.refreshType;

        option.value.val = getValueInRange(option.value.val);
    }

    function getCenteringTransform(rc) {
        return 'translate(' + (rc.width/2) + ',' + (rc.height/2) + ')';
    }

    function getRadius(rc) {
        var r, height, width, aspect;
        switch (option.gauge.type) {
        case 'half':
            if (rc.width > rc.height) {
                height = rc.height;
                width = height * 1.25;
                if (width > rc.width) {
                    aspect = width / rc.width;
                    width = width / aspect;
                    height = height / aspect;
                }
            } else if (rc.width < rc.height) {
                width = rc.width;
                height = width / 1.25;
                if (height > rc.height) {
                    aspect = width / rc.height;
                    height = height / aspect;
                    width = height / aspect;
                }
            } else {
                width = rc.width;
                height = width * 0.75;
            }
            r = Math.floor(Math.min(width, height) / 2);
            break;
        }
        return r;
    }

    function getValueInRange(val) {
        return Math.max(option.value.min, Math.min(option.value.max, val));
    }

    function humanFriendlyNumber(n, d) {
        var p, d2, i, s, minus;

        minus = false;
        if (n < 0) {
            minus = true;
            n *= -1;
        }
        p = Math.pow;
        d2 = p(10, d);
        i = 7;
        while (i) {
            s = p(10,i--*3);
            if (s <= n)
                n = Math.round(n*d2/s)/d2+'KMGTPE'[i];
        }
        if (minus === true)
            n = '-' + n;
        return n;
    }

    function genArc(radius) {
        var arc;
        switch (option.gauge.type) {
        case 'half':
            startArcAngle = -Math.PI/2;
            endArcAngle = Math.PI/2;
            arc = d3.svg.arc()
                .innerRadius(radius-getGaugeWidth())
                .outerRadius(radius)
                .startAngle(startArcAngle)
                .endAngle(endArcAngle);
            break;
        }
        return arc;
    }

    function genArcBg(radius, center, arc) {
        var arcbg;
        switch (option.gauge.type) {
        case 'half':
            arcbg = center.append('path')
                .style('fill', option.gauge.color)
                .attr('d', arc)
                .attr('transform', 'translate(0,'+Math.floor(radius/2)+')');
            break;
        }
        return arcbg;
    }

    function genArcVal(radius, center, arc) {
        var arcval;
        switch (option.gauge.type) {
        case 'half':
            arcval = center.append('path')
                .style('fill', getGaugeValueColor(option.value.val, 0))
                .attr('d', arc)
                .attr('transform', 'translate(0,'+Math.floor(radius/2)+')');
            break;
        }
        return arcval;
    }

    function calcAttributes(radius) {
        var attr = {
            value: {
                fontsize: '',
                dy: ''
            },
            label: {
                fontsize: '',
                dy: ''
            },
            minmax: {
                fontsize: '',
                dy: '',
                min_x: 0,
                max_x: 0
            }
        };

        switch (option.gauge.type) {
        case 'half':
            attr.value.fontsize = (2.2*radius/_CRITERIA_R).toFixed(2) + 'em';
            attr.value.dy = '1.8em';
            attr.label.fontsize = (0.9*radius/_CRITERIA_R).toFixed(2) + 'em';
            attr.label.dy = '5.9em';
            attr.minmax.fontsize = (0.9*radius/_CRITERIA_R).toFixed(2) + 'em';
            attr.minmax.dy = '5.9em';
            var x = radius - getGaugeWidth()/2;
            attr.minmax.min_x = -x;
            attr.minmax.max_x = x;
            break;
        }
        return attr;
    }

    function formatNumber(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    function getGaugeWidth() {
        return Math.floor(option.gauge.widthScale*_CRITERIA_R/2.5);
    }

    function getGaugeValueColor(val, percentage) {
        var _cutHex = function(str) {
            return (str.charAt(0)==='#') ? str.substring(1,7) : str;
        };

        if (option.level.customSectors.length > 0) {
            var res = _.findIndex(option.level.customSectors, function(cs) {
                return (val > cs.lo && val <= cs.hi);
            });
            if (res >= 0)
                return option.level.customSectors[res].color;
        }

        var colorlen = option.level.colors.length;
        if (colorlen === 1)
            return option.level.colors[0];
        var inc = (option.gauge.noGradient) ? (1 / colorlen) : (1 / (colorlen - 1));
        var colors = [];

        for (var i = 0; i < colorlen; i++) {
            colors.push({
                percentage: (option.gauge.noGradient) ? (inc * (i + 1)) : (inc * i),
                color: {
                    r: parseInt((_cutHex(option.level.colors[i])).substring(0,2), 16),
                    g: parseInt((_cutHex(option.level.colors[i])).substring(2,4), 16),
                    b: parseInt((_cutHex(option.level.colors[i])).substring(4,6), 16)
                }
            });
        }

        if (percentage === 0)
            return 'rgb(' + [colors[0].color.r, colors[0].color.g, colors[0].color.b].join(',') + ')';

        var range, rangePer, perLower, perUpper, color, lower, upper;
        for (var j = 0; j < colors.length; j++) {
            if (percentage <= colors[j].percentage) {
                if (option.gauge.noGradient) {
                    return 'rgb(' + [colors[j].color.r, colors[j].color.g, colors[j].color.b].join(',') + ')';
                } else {
                    lower = colors[j - 1];
                    upper = colors[j];
                    range = upper.percentage - lower.percentage;
                    rangePer = (percentage - lower.percentage) / range;
                    perLower = 1 - rangePer;
                    perUpper = rangePer;
                    color = {
                        r: Math.floor(lower.color.r * perLower + upper.color.r * perUpper),
                        g: Math.floor(lower.color.g * perLower + upper.color.g * perUpper),
                        b: Math.floor(lower.color.b * perLower + upper.color.b * perUpper)
                    };
                    return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
                }
            }
        }
    }

    function getValueText() {
        var val;
        if (option.value.humanFriendly)
            val = humanFriendlyNumber(option.value.val, option.value.humanFriendlyDecimal);
        else
            val = (option.value.formatNumber === true) ? formatNumber(option.value.val) : option.value.val;
        return val;
    }

    function getMinValueText() {
        var val;
        if (option.value.humanFriendlyMinMax)
            val = humanFriendlyNumber(option.value.min, option.value.humanFriendlyDecimal);
        else {
            val = option.value.min.toFixed(option.value.decimal);
            val = (option.value.formatNumber === true) ? formatNumber(val) : val;
        }
        return val;
    }

    function getMaxValueText() {
        var val;
        if (option.value.humanFriendlyMinMax)
            val = humanFriendlyNumber(option.value.max, option.value.humanFriendlyDecimal);
        else {
            val = option.value.max.toFixed(option.value.decimal);
            val = (option.value.formatNumber === true) ? formatNumber(val) : val;
        }
        return val;
    }

    function createD3() {
        var rc = parentNode.getBoundingClientRect();

        d3var.svg = d3.select('#' + option.bindto)
            .append('svg')
            .attr('width', rc.width)
            .attr('height', rc.height);

        d3var.center = d3var.svg.append('g')
            .style('opacity', 0)
            .attr('transform', getCenteringTransform(rc));

        var r = getRadius(rc);

        d3var.arc = genArc(r);
        d3var.arc_bg = genArcBg(r, d3var.center, d3var.arc);
        d3var.arc_level = genArcVal(r, d3var.center, d3var.arc);

        var attributes = calcAttributes(r);

        d3var.value = d3var.center.append('text')
            .datum(option.value.val)
            .text(getValueText())
            .style('fill', option.value.color)
            .style('text-anchor', 'middle')
            .attr('dy', attributes.value.dy)
            .attr('font-size', attributes.value.fontsize)
            .attr('class', option.value.class);

        d3var.label = d3var.center.append('text')
            .text(option.label.text)
            .style('fill', option.label.color)
            .style('text-anchor', 'middle')
            .attr('dy', attributes.label.dy)
            .attr('font-size', attributes.label.fontsize)
            .attr('class', option.label.class);

        d3var.min = d3var.center.append('text')
            .datum(option.value.min)
            .text(getMinValueText())
            .style('fill', option.label.color)
            .style('text-anchor', 'middle')
            .attr('dy', attributes.minmax.dy)
            .attr('x', attributes.minmax.min_x)
            .attr('font-size', attributes.minmax.fontsize)
            .attr('class', option.label.class);

        d3var.max = d3var.center.append('text')
            .datum(option.value.max)
            .text(getMaxValueText())
            .style('fill', option.label.color)
            .style('text-anchor', 'middle')
            .attr('dy', attributes.minmax.dy)
            .attr('x', attributes.minmax.max_x)
            .attr('font-size', attributes.minmax.fontsize)
            .attr('class', option.label.class);
    }

    function initialTransition() {
        d3var.center.transition()
            .duration(option.animation.startTime)
            .ease(option.animation.startType)
            .style('opacity', 1);
    }

    function resize() {
        if (_.isUndefined(d3var.svg))
            return;

        var rc = parentNode.getBoundingClientRect();

        d3var.svg.attr('height', rc.height)
            .attr('width', rc.width);

        d3var.center.attr('transform', getCenteringTransform(rc));

        var r = getRadius(rc);

        d3var.arc.innerRadius(r-getGaugeWidth())
                .outerRadius(r);

        d3var.arc_bg.remove();
        d3var.arc_bg = genArcBg(r, d3var.center, d3var.arc);

        d3var.arc_level.remove();
        d3var.arc_level = genArcVal(r, d3var.center, d3var.arc);

        var attributes = calcAttributes(r);

        d3var.value.attr('font-size', attributes.value.fontsize);

        d3var.label.attr('font-size', attributes.label.fontsize);

        d3var.min.attr('font-size', attributes.minmax.fontsize)
            .attr('x', attributes.minmax.min_x);

        d3var.max.attr('font-size', attributes.minmax.fontsize)
            .attr('x', attributes.minmax.max_x);
    }

    function valueTransition(val) {
        d3var.value.transition()
            .duration(option.animation.refreshTime)
            .ease(option.animation.refreshType)
            .tween('text', function(d) {
                var i = d3.interpolate(d, val);
                d = val;
                return function(t) {
                    if (option.value.humanFriendly)
                        this.textContent = humanFriendlyNumber(i(t).toFixed(option.value.humanFriendlyDecimal), option.value.humanFriendlyDecimal);
                    else {
                        if (option.value.formatNumber)
                            this.textContent = formatNumber(i(t).toFixed(option.value.decimal));
                        else
                            this.textContent = i(t).toFixed(option.value.decimal);
                    }
                };
            });
    }

    function getValueAngle(val) {
        var range, newval;
        if (option.value.min < 0) {
            if (option.value.max < 0) {
                range = Math.abs(option.value.min) - Math.abs(option.value.max);
            } else {
                newval = val + Math.abs(option.value.min);
                range = option.value.max + Math.abs(option.value.min);
            }
        } else {
            range = option.value.max - option.value.min;
        }

        var per = (100/range)*(newval);
        var rangeAngle, angle;

        switch (option.gauge.type) {
            case 'half':
                rangeAngle = 180;
                angle = (rangeAngle/100)*per - rangeAngle/2;
                angle = angle * Math.PI/180;
                break;
        }
        return angle;
    }

    function levelArcTransition(val) {
        var endAngle = getValueAngle(val);

        // value text transition
        curArcAngle = startArcAngle;
        d3var.arc_level.datum(endAngle);
        d3var.arc_level.transition()
            .duration(option.animation.refreshTime)
            .ease(option.animation.refreshType)
            .attrTween('d', function(d) {
                var i = d3.interpolate(curArcAngle, d);
                return function(t) {
                    curArcAngle=i(t);
                    return d3var.arc.endAngle(i(t))();
                };
            });
    }

    function refresh(val, min, max) {
        if (_.isUndefined(d3var.svg))
            return;

        if (!_.isUndefined(min)) {
            option.value.min = min;
            d3var.min.datum(option.value.min)
                .text(getMinValueText());
        }

        if (!_.isUndefined(max)) {
            option.value.max = max;
            d3var.max.datum(option.value.max)
                .text(getMaxValueText());
        }

        val = getValueInRange(val);
        option.value.val = val;

        valueTransition(val);
        levelArcTransition(val);
    }

    // Public API
    return {
        resize: function() {
            resize();
        },

        refresh: function(val, min, max) {
            refresh(Number(val), min, max);
        }
    };
};