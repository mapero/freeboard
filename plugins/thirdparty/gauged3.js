// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ GaugeD3.js                                                                                                                            │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2015 Daisuke Tanaka (https://github.com/tanaka0323)                                                                        │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                                                                                        │ \\
// └────────────────────────────────────────────────────────────────────┘ \\

GaugeD3 = function(_option) {
    'use strict';

    var self = this;
    var version = '1.0.0';

    var parentNode = null;

    var _CRITERIA_R = 112;
    var _CRITERIA_QUARTER_R = Math.floor(_CRITERIA_R*1.66);
    var _TO_RADIANS = Math.PI/180;
    var _QUARTER_DIV = 1.3;

    var gaugeTypes = [
        'half',
        'quarter-left-top', 'quarter-right-top',
        'quarter-left-bottom', 'quarter-right-bottom',
        'threequarter-left-top', 'threequarter-right-top',
        'threequarter-left-bottom', 'threequarter-right-bottom',
        'donut'
    ];

    // d3 variables
    var d3var = {
        svg: null,
        center: null,
        arc: null,
        arc_bg: null,
        arc_level: null,
        title: null,
        value: null,
        label: null,
        min: null,
        max: null
    };

    var startArcAngle, endArcAngle, curArcAngle = 0;

    // default option
    var default_option = {
        // type string : this is container element id
        bindto: '',

        title: {
            // type string : gauge title
            text: '',
            // type string : color of gauge title
            color: '#999999',
            // type string : css class
            class: ''
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
            // type bool : enable value transition
            transition: true,
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
            // type int : gauge type
            // (half, quarter-left-top, quarter-right-top, quarter-left-bottom, quarter-right-bottom, threequarter-left-top, threequarter-right-top, threequarter-left-bottom, threequarter-right-bottom, donut)
            type: 'half',
            // donut options
            donut: {
                // type int : start angle (0-359)
                startAngle: 0
            }
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
            // ex: customSectors: [ {
            //            hi: -1000,
            //            lo: -5000,
            //            color: 'rgb(10, 10, 10)'
            //     } ]
            customSectors : [],
        },

        transition: {
            // type int : length of initial transition
            startTime: 700,
            // type string : type of initial transition (linear, quad, cubic, sin, exp, circle, elastic, back, bounce) + -in -out -in-out -out-in
            startType: 'linear',
            // type int : length of refresh transition
            refreshTime: 700,
            // type string : type of refresh transition (linear, quad, cubic, sin, exp, circle, elastic, back, bounce) + -in -out -in-out -out-in
            refreshType: 'circle-out'
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
        if (_.indexOf(gaugeTypes, option.gauge.type) === -1)
            option.gauge.type = gaugeTypes[0];

        option.gauge.donut.startAngle = Math.max(0, Math.min(Number(opt.gauge.donut.startAngle), 359));

        option.label.text = opt.label.text;
        option.label.color = opt.label.color;
        option.label.class = opt.label.class;

        option.level.colors = opt.level.colors;
        option.level.counter = opt.level.counter;
        option.level.customSectors = opt.level.customSectors;

        option.transition.startTime = Number(opt.transition.startTime);
        option.transition.startType = opt.transition.startType;
        option.transition.refreshTime = Number(opt.transition.refreshTime);
        option.transition.refreshType = opt.transition.refreshType;

        option.value.val = getValueInRange(option.value.val);
    }

    function getCenteringTransform(rc) {
        return 'translate(' + (rc.width/2) + ',' + (rc.height/2) + ')';
    }

    function getRadius(rc) {
        var r, height, width, aspect;

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

        switch (option.gauge.type) {
        case 'threequarter-left-top':
        case 'threequarter-right-top':
        case 'threequarter-left-bottom':
        case 'threequarter-right-bottom':
        case 'donut':
            r = Math.floor(Math.min(width, height) / 2.15);
            break;
        case 'half':
            r = Math.floor(Math.min(width, height) / 2);
            break;

        case 'quarter-left-top':
        case 'quarter-right-top':
        case 'quarter-left-bottom':
        case 'quarter-right-bottom':
            r = Math.floor(Math.min(width, height) / _QUARTER_DIV);
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
            break;
        case 'donut':
            startArcAngle = option.gauge.donut.startAngle * _TO_RADIANS;
            endArcAngle = 360 * _TO_RADIANS + startArcAngle;
            break;
        case 'quarter-left-top':
            startArcAngle = -Math.PI/2;
            endArcAngle = 0;
            break;
        case 'quarter-right-top':
            startArcAngle = 0;
            endArcAngle = Math.PI/2;
            break;
        case 'quarter-left-bottom':
            startArcAngle = Math.PI;
            endArcAngle = Math.PI/2*3;
            break;
        case 'quarter-right-bottom':
            startArcAngle = Math.PI/2;
            endArcAngle = Math.PI;
            break;
        case 'threequarter-left-top':
            startArcAngle = 0;
            endArcAngle = Math.PI/2*3;
            break;
        case 'threequarter-right-top':
            startArcAngle = Math.PI/2;
            endArcAngle = 360 * _TO_RADIANS;
            break;
        case 'threequarter-left-bottom':
            startArcAngle = -Math.PI/2;
            endArcAngle = Math.PI;
            break;
        case 'threequarter-right-bottom':
            startArcAngle = -Math.PI;
            endArcAngle = Math.PI/2;
            break;
        }
        arc = d3.svg.arc()
            .innerRadius(radius-getGaugeWidth(radius))
            .outerRadius(radius)
            .startAngle(startArcAngle)
            .endAngle(endArcAngle);
        return arc;
    }

    function genArcBg(radius, center, arc) {
        var arcbg = center.insert('path', 'text')
            .style('fill', option.gauge.color)
            .attr('d', arc);

        switch (option.gauge.type) {
        case 'half':
            arcbg.attr('transform', 'translate(0,'+Math.floor(radius/2)+')');
            break;
        case 'quarter-left-top':
            arcbg.attr('transform', 'translate('+Math.floor(radius/2)+','+Math.floor(radius/2)+')');
            break;
        case 'quarter-right-top':
            arcbg.attr('transform', 'translate(-'+Math.floor(radius/2)+','+Math.floor(radius/2)+')');
            break;
        case 'quarter-left-bottom':
            arcbg.attr('transform', 'translate('+Math.floor(radius/2)+',-'+Math.floor(radius/2)+')');
            break;
        case 'quarter-right-bottom':
            arcbg.attr('transform', 'translate(-'+Math.floor(radius/2)+',-'+Math.floor(radius/2)+')');
            break;
        }
        return arcbg;
    }

    function genArcVal(radius, center, arc) {
        var arcval = center.insert('path', 'text')
                .style('fill', getGaugeValueColor(option.value.val, 0))
                .attr('d', arc);

        switch (option.gauge.type) {
        case 'half':
            arcval.attr('transform', 'translate(0,'+Math.floor(radius/2)+')');
            break;
        case 'quarter-left-top':
            arcval.attr('transform', 'translate('+Math.floor(radius/2)+','+Math.floor(radius/2)+')');
            break;
        case 'quarter-right-top':
            arcval.attr('transform', 'translate(-'+Math.floor(radius/2)+','+Math.floor(radius/2)+')');
            break;
        case 'quarter-left-bottom':
            arcval.attr('transform', 'translate('+Math.floor(radius/2)+',-'+Math.floor(radius/2)+')');
            break;
        case 'quarter-right-bottom':
            arcval.attr('transform', 'translate(-'+Math.floor(radius/2)+',-'+Math.floor(radius/2)+')');
            break;
        }
        return arcval;
    }

    function calcAttributes(radius) {
        var attr = {
            title: {
                fontsize: '',
                dy: '',
                x: 0
            },
            value: {
                fontsize: '',
                dy: '',
                x: 0
            },
            label: {
                fontsize: '',
                dy: '',
                x: 0
            },
            minmax: {
                fontsize: '',
                min_dy: '',
                max_dy: '',
                min_x: 0,
                max_x: 0
            }
        };
        var x, xt, x2;

        switch (option.gauge.type) {
        case 'half':
        case 'threequarter-left-top':
        case 'threequarter-right-top':
        case 'threequarter-left-bottom':
        case 'threequarter-right-bottom':
        case 'donut':
            attr.title.fontsize = (1.3*radius/_CRITERIA_R).toFixed(2) + 'em';
            attr.value.fontsize = (2.2*radius/_CRITERIA_R).toFixed(2) + 'em';
            attr.label.fontsize = (0.9*radius/_CRITERIA_R).toFixed(2) + 'em';
            attr.minmax.fontsize = (0.9*radius/_CRITERIA_R).toFixed(2) + 'em';

            switch (option.gauge.type) {
            case 'half':
                attr.title.dy = '-4.5em';
                attr.value.dy = '1.7em';
                attr.label.dy = '5.9em';
                attr.minmax.min_dy = attr.minmax.max_dy = '5.9em';
                x = radius - getGaugeWidth(radius)/2;
                attr.minmax.min_x = -x;
                attr.minmax.max_x = x;
                break;
            case 'threequarter-left-top':
            case 'threequarter-right-top':
            case 'threequarter-left-bottom':
            case 'threequarter-right-bottom':
            case 'donut':
                attr.title.dy = '-1.3em';
                attr.value.dy = '.3em';
                attr.label.dy = '2.3em';
                switch (option.gauge.type) {
                case 'donut':
                    attr.minmax.min_dy = attr.minmax.max_dy = '7.5em';
                    x = radius;
                    attr.minmax.min_x = -x;
                    attr.minmax.max_x = x;
                    break;
                case 'threequarter-left-top':
                    attr.minmax.min_dy = '1.3em';
                    attr.minmax.max_dy = '-0.6em';
                    x = radius - getGaugeWidth(radius)/2;
                    attr.minmax.min_x = -x;
                    attr.minmax.max_x = -x;
                    break;
                case 'threequarter-right-top':
                    attr.minmax.min_dy = '-0.6em';
                    attr.minmax.max_dy = '1.3em';
                    x = radius - getGaugeWidth(radius)/2;
                    attr.minmax.min_x = x;
                    attr.minmax.max_x = x;
                    break;
                case 'threequarter-left-bottom':
                    attr.minmax.min_dy = '1.3em';
                    attr.minmax.max_dy = '-0.6em';
                    x = radius - getGaugeWidth(radius)/2;
                    attr.minmax.min_x = -x;
                    attr.minmax.max_x = -x;
                    break;
                case 'threequarter-right-bottom':
                    attr.minmax.min_dy = '-0.6em';
                    attr.minmax.max_dy = '1.3em';
                    x = radius - getGaugeWidth(radius)/2;
                    attr.minmax.min_x = x;
                    attr.minmax.max_x = x;
                    break;
                }
            }
            break;
        case 'quarter-left-top':
        case 'quarter-right-top':
        case 'quarter-left-bottom':
        case 'quarter-right-bottom':
            attr.title.fontsize = (1.3*radius/_CRITERIA_QUARTER_R).toFixed(2) + 'em';
            attr.value.fontsize = (2.5*radius/_CRITERIA_QUARTER_R).toFixed(2) + 'em';
            attr.label.fontsize = (0.9*radius/_CRITERIA_QUARTER_R).toFixed(2) + 'em';
            attr.minmax.fontsize = (0.9*radius/_CRITERIA_QUARTER_R).toFixed(2) + 'em';

            xt = radius / 2.3;
            x = radius / 3;
            x2 = radius / 2 - getGaugeWidth(radius) / 2;

            switch (option.gauge.type) {
            case 'quarter-left-top':
                attr.title.dy = '-5em';
                attr.value.dy = '1.9em';
                attr.label.dy = '7em';
                attr.minmax.min_dy = '8.7em';
                attr.minmax.max_dy = '8.7em';
                attr.title.x = -xt;
                attr.value.x = x;
                attr.label.x = x;
                attr.minmax.min_x = -x2;
                attr.minmax.max_x = x2;
                break;
            case 'quarter-right-top':
                attr.title.dy = '-5em';
                attr.value.dy = '1.9em';
                attr.label.dy = '7em';
                attr.minmax.min_dy = '8.7em';
                attr.minmax.max_dy = '8.7em';
                attr.title.x = xt;
                attr.value.x = -x;
                attr.label.x = -x;
                attr.minmax.min_x = -x2;
                attr.minmax.max_x = x2;
                break;
            case 'quarter-left-bottom':
                attr.title.dy = '5em';
                attr.value.dy = '-1.7em';
                attr.label.dy = '-3.1em';
                attr.minmax.min_dy = '-8em';
                attr.minmax.max_dy = '-8em';
                attr.title.x = -xt;
                attr.value.x = x;
                attr.label.x = x;
                attr.minmax.min_x = x2;
                attr.minmax.max_x = -x2;
                break;
            case 'quarter-right-bottom':
                attr.title.dy = '5em';
                attr.value.dy = '-1.7em';
                attr.label.dy = '-3.1em';
                attr.minmax.min_dy = '-8em';
                attr.minmax.max_dy = '-8em';
                attr.title.x = xt;
                attr.value.x = -x;
                attr.label.x = -x;
                attr.minmax.min_x = x2;
                attr.minmax.max_x = -x2;
                break;
            }
            break;
        }
        return attr;
    }

    function formatNumber(x) {
        var parts = x.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    function getGaugeWidth(radius) {
        return Math.floor(option.gauge.widthScale*(radius/2.5));
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
        else
            val = (option.value.formatNumber === true) ? formatNumber(option.value.min) : option.value.min;
        return val;
    }

    function getMaxValueText() {
        var val;
        if (option.value.humanFriendlyMinMax)
            val = humanFriendlyNumber(option.value.max, option.value.humanFriendlyDecimal);
        else
            val = (option.value.formatNumber === true) ? formatNumber(option.value.max) : option.value.max;
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
        curArcAngle = startArcAngle;

        var attributes = calcAttributes(r);

        d3var.title = d3var.center.append('text')
            .text(option.title.text)
            .style('fill', option.title.color)
            .style('text-anchor', 'middle')
            .attr('dy', attributes.title.dy)
            .attr('x', attributes.title.x)
            .attr('font-size', attributes.title.fontsize)
            .attr('class', option.title.class);

        d3var.value = d3var.center.append('text')
            .data([{ value: option.value.val }])
            .text(getValueText())
            .style('fill', option.value.color)
            .style('text-anchor', 'middle')
            .attr('dy', attributes.value.dy)
            .attr('x', attributes.value.x)
            .attr('font-size', attributes.value.fontsize)
            .attr('class', option.value.class);

        d3var.label = d3var.center.append('text')
            .text(option.label.text)
            .style('fill', option.label.color)
            .style('text-anchor', 'middle')
            .attr('dy', attributes.label.dy)
            .attr('x', attributes.label.x)
            .attr('font-size', attributes.label.fontsize)
            .attr('class', option.label.class);

        if (option.value.hide === true) {
            d3var.value.style('display', 'none');
            d3var.label.style('display', 'none');
        }

        d3var.min = d3var.center.append('text')
            .text(getMinValueText())
            .style('fill', option.label.color)
            .style('text-anchor', 'middle')
            .attr('dy', attributes.minmax.min_dy)
            .attr('x', attributes.minmax.min_x)
            .attr('font-size', attributes.minmax.fontsize)
            .attr('class', option.label.class);

        d3var.max = d3var.center.append('text')
            .text(getMaxValueText())
            .style('fill', option.label.color)
            .style('text-anchor', 'middle')
            .attr('dy', attributes.minmax.max_dy)
            .attr('x', attributes.minmax.max_x)
            .attr('font-size', attributes.minmax.fontsize)
            .attr('class', option.label.class);

        if (option.value.hideMinMax === true) {
            d3var.min.style('display', 'none');
            d3var.max.style('display', 'none');
        }

        switch (option.gauge.type) {
        case 'quarter-left-top':
            d3var.max.attr('transform', 'rotate(-90)');
            break;
        case 'quarter-right-top':
            d3var.min.attr('transform', 'rotate(90)');
            break;
        case 'quarter-left-bottom':
            d3var.min.attr('transform', 'rotate(90)');
            break;
        case 'quarter-right-bottom':
            d3var.max.attr('transform', 'rotate(-90)');
            break;
        case 'threequarter-left-top':
            d3var.min.attr('transform', 'rotate(90)');
            break;
        case 'threequarter-right-top':
            d3var.max.attr('transform', 'rotate(-90)');
            break;
        case 'threequarter-left-bottom':
            d3var.max.attr('transform', 'rotate(-90)');
            break;
        case 'threequarter-right-bottom':
            d3var.min.attr('transform', 'rotate(90)');
            break;
        }
    }

    function resize() {
        if (_.isNull(d3var.svg))
            return;

        var rc = parentNode.getBoundingClientRect();

        d3var.svg.attr('height', rc.height)
            .attr('width', rc.width);

        d3var.center.attr('transform', getCenteringTransform(rc));

        var r = getRadius(rc);

        d3var.arc.innerRadius(r-getGaugeWidth(r))
                .outerRadius(r)
                .endAngle(endArcAngle);

        d3var.arc_bg.remove();
        d3var.arc_bg = genArcBg(r, d3var.center, d3var.arc);

        d3var.arc.endAngle(curArcAngle);

        d3var.arc_level.remove();
        d3var.arc_level = genArcVal(r, d3var.center, d3var.arc);

        var attributes = calcAttributes(r);

        d3var.title.attr('font-size', attributes.title.fontsize)
            .attr('x', attributes.title.x);
        d3var.value.attr('font-size', attributes.value.fontsize)
            .attr('x', attributes.value.x);
        d3var.label.attr('font-size', attributes.label.fontsize)
            .attr('x', attributes.label.x);
        d3var.min.attr('font-size', attributes.minmax.fontsize)
            .attr('x', attributes.minmax.min_x);
        d3var.max.attr('font-size', attributes.minmax.fontsize)
            .attr('x', attributes.minmax.max_x);
    }

    function calcPercentage(val) {
       var range, newval;
        if (option.value.min < 0) {
            if (option.value.max < 0) {
                newval = Math.abs(val + Math.abs(option.value.min));
                range = Math.abs(option.value.min) - Math.abs(option.value.max);
            } else {
                newval = val + Math.abs(option.value.min);
                range = option.value.max + Math.abs(option.value.min);
            }
        } else {
            newval = val - option.value.min;
            range = option.value.max - option.value.min;
        }
        return ((100/range)*newval)/100;
    }

    function initialTransition() {
        d3var.center.transition()
            .duration(option.transition.startTime)
            .ease(option.transition.startType)
            .style('opacity', 1);
    }

    function valueTransition(val) {
        d3var.value.transition()
            .duration(option.transition.refreshTime)
            .ease(option.transition.refreshType)
            .tween('text', function(d) {
                var i = d3.interpolate(d.value, val);
                d.value = val;
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

    function levelArcTransition(val) {
        var per = calcPercentage(val);

        var endAngle = (function(per) {
            var angle;

            var _calcAngle = function(perc, range, stangle) {
                return (range * perc + stangle) * _TO_RADIANS;
            };

            switch (option.gauge.type) {
            case 'half':
                angle = _calcAngle(per, 180, -90);
                break;
            case 'donut':
                angle = _calcAngle(per, 360, option.gauge.donut.startAngle);
                break;
            case 'quarter-left-top':
                angle = _calcAngle(per, 90, -90);
                break;
            case 'quarter-right-top':
                angle = _calcAngle(per, 90, 0);
                break;
            case 'quarter-left-bottom':
                angle = _calcAngle(per, 90, 180);
                break;
            case 'quarter-right-bottom':
                angle = _calcAngle(per, 90, 90);
                break;
            case 'threequarter-left-top':
                angle = _calcAngle(per, 270, 0);
                break;
            case 'threequarter-right-top':
                angle = _calcAngle(per, 270, 90);
                break;
            case 'threequarter-left-bottom':
                angle = _calcAngle(per, 270, -90);
                break;
            case 'threequarter-right-bottom':
                angle = _calcAngle(per, 270, -180);
                break;
            }
            return angle;
        })(per);

        d3var.arc_level.datum(endAngle);
        d3var.arc_level.transition()
            .duration(option.transition.refreshTime)
            .ease(option.transition.refreshType)
            .style('fill', getGaugeValueColor(val, per))
            .attrTween('d', function(d) {
                var i = d3.interpolate(curArcAngle, d);
                return function(t) {
                    curArcAngle = i(t);
                    return d3var.arc.endAngle(i(t))();
                };
            });
    }

    function refresh(val, min, max) {
        if (_.isNull(d3var.svg))
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

        if (option.value.transition === true)
            valueTransition(val);
        else
            d3var.value.text(getValueText());

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