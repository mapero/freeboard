// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ Gauge D3.js                                                                                                                            │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2015 Daisuke Tanaka (https://github.com/tanaka0323)                                                                        │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                                                                                        │ \\
// └────────────────────────────────────────────────────────────────────┘ \\

GaugeD3 = function(_config) {
    'use strict';

    var self = this;
    var gaudeD3 = { version: "1.0.0" };

    var parentNode = null;
    var attributes = {};

    // d3 variables
    var d3var = {
        svg: null,
        center: null,
        value: null
    };

    var default_config = {
        // type string : this is container element id
        bindto: '',

        title: {
            // type string : gauge title
            text: '',
            // type string : color of gauge title
            color: '#999999',
            // type int : absolute minimum font size for the title
            minFontSize: 10
        },

        value: {
            // type float : value gauge is showing
            val: 0,
            // type string : color of label showing current value
            color: '#010101',
            // type string : special symbol to show next to value
            symbol: '',
            // type float : min value
            min: 0,
            // type float : max value
            max: 100,
            // type int : number of decimal places for our human friendly number to contain
            humanFriendlyDecimal: 0,
            // type int : absolute minimum font size for the value
            minFontSize: 16,
            // type int : absolute minimum font size for the minimum label
            minMinFontSize: 10,
            // type int : absolute minimum font size for the maximum label
            maxMinFontSize: 10,
            // type bool : hide value text
            hide: false,
            // type bool : hide min and max values
            hideMinMax: false,
            // type bool : convert large numbers for min, max, value to human friendly (e.g. 1234567 -> 1.23M)
            humanFriendlyMinMax: false,
            // type int : number of digits after floating point
            decimals: 0,
            // type bool : formats numbers with commas where appropriate
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
            // type int : gauge shape 0:half 1:fan 2:donut
            shape: 0,
            // type bool : whether gauge size should follow changes in container element size
            relativeSize: false
        },

        label: {
            // type string : text to show below value
            text: '',
            // type string : color of label showing label under value
            color: '#edebeb',
            // type string : css class
            class: '',
            // type int : absolute minimum font size for the label
            minFontSize: 10
        },

        shadow: {
            // type int : 0 - 1
            opacity: 0.2,
            // type int: inner shadow size
            size: 5,
            // type int : how much shadow is offset from top
            verticalOffset : 3,
            // type bool : hide inner shadow
            hide: false
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
            // type string : type of initial animation (linear, >, <,  <>, bounce)
            startType: '>',
            // type int : length of refresh animation
            refreshTime: 700,
            // type string : type of refresh animation (linear, >, <,  <>, bounce)
            refreshType: '>'
        },

        donut: {
            // type int : angle to start from when in donut mode
            startAngle: 90
        }
    };

    var config = default_config;

    // Initialize
    var ret = (function(cfg) {
        if (_.isNull(cfg) || _.isUndefined(cfg)) {
            console.error('GaugeD3: Make sure to pass options to the constructor!');
            return false;
        }
        if (_.isNull(cfg.bindto) || _.isUndefined(cfg.bindto)) {
            console.error('GaugeD3: No element with id : %s found', config.bindto);
            return false;
        }

        parentNode = document.getElementById(cfg.bindto);
        if (!parentNode) {
            console.error('GaugeD3: No element with id : %s found', cfg.bindto);
            return false;
        }

        setConfig(_.merge(default_config, cfg));

        createD3();

    }(_config));

    if (ret === false)
        return null;

    function setConfig(cfg) {
        config.bindto = cfg.bindto;

        if (!_.isUndefined(cfg.title)) {
            if (!_.isUndefined(cfg.title.text))
                config.title.text = cfg.title.text;
            if (!_.isUndefined(config.title.color))
                config.title.color = cfg.title.color;
            if (!_.isUndefined(config.title.minFontSize))
                config.title.minFontSize = Number(cfg.title.minFontSize);
        }

        if (!_.isUndefined(cfg.value)) {
            if (!_.isUndefined(cfg.value.val))
                config.value.val = Number(cfg.value.val);
            if (!_.isUndefined(cfg.value.color))
                config.value.color = cfg.value.color;
            if (!_.isUndefined(cfg.value.symbol))
                config.value.symbol = cfg.value.symbol;
            if (!_.isUndefined(cfg.value.min))
                config.value.min = Number(cfg.value.min);
            if (!_.isUndefined(cfg.value.max))
                config.value.max = Number(cfg.value.max);
            if (!_.isUndefined(cfg.value.humanFriendlyDecimal))
                config.value.humanFriendlyDecimal = Number(cfg.value.humanFriendlyDecimal);
            if (!_.isUndefined(cfg.value.minFontSize))
                config.value.minFontSize = Number(cfg.value.minFontSize);
            if (!_.isUndefined(cfg.value.minMinFontSize))
                config.value.minMinFontSize = Number(cfg.value.minMinFontSize);
            if (!_.isUndefined(cfg.value.maxMinFontSize))
                config.value.maxMinFontSize = Number(cfg.value.maxMinFontSize);
            if (!_.isUndefined(cfg.value.hide))
                config.value.hide = cfg.value.hide;
            if (!_.isUndefined(cfg.value.hideMinMax))
                config.value.hideMinMax = cfg.value.hideMinMax;
            if (!_.isUndefined(cfg.value.humanFriendlyMinMax))
                config.value.humanFriendlyMinMax = cfg.value.humanFriendlyMinMax;
            if (!_.isUndefined(cfg.value.decimals))
                config.value.decimals = Number(cfg.value.decimals);
            if (!_.isUndefined(cfg.value.formatNumber))
                config.value.formatNumber = cfg.value.formatNumber;
            if (!_.isUndefined(cfg.value.class))
                config.value.class = cfg.value.class;
        }

        if (!_.isUndefined(cfg.gauge)) {
            if (!_.isUndefined(cfg.gauge.widthScale))
                config.gauge.widthScale = Number(cfg.gauge.widthScale);
            if (!_.isUndefined(cfg.gauge.color))
                config.gauge.color = cfg.gauge.color;
            if (!_.isUndefined(cfg.gauge.noGradient))
                config.gauge.noGradient = cfg.gauge.noGradient;
            if (!_.isUndefined(cfg.gauge.shape))
                config.gauge.shape = Number(cfg.gauge.shape);
            if (!_.isUndefined(cfg.gauge.relativeSize))
                config.gauge.relativeSize = cfg.gauge.relativeSize;
        }

        if (!_.isUndefined(cfg.label)) {
            if (!_.isUndefined(cfg.label.text))
                config.label.text = Number(cfg.label.text);
            if (!_.isUndefined(cfg.label.color))
                config.label.color = cfg.label.color;
            if (!_.isUndefined(cfg.label.class))
                config.label.class = cfg.label.class;
            if (!_.isUndefined(cfg.label.minFontSize))
                config.label.minFontSize = Number(cfg.label.minFontSize);
        }

        if (!_.isUndefined(cfg.shadow)) {
            if (!_.isUndefined(cfg.shadow.opacity))
                config.shadow.opacity = Number(cfg.shadow.opacity);
            if (!_.isUndefined(cfg.shadow.size))
                config.shadow.size = Number(cfg.shadow.size);
            if (!_.isUndefined(cfg.shadow.verticalOffset))
                config.shadow.verticalOffset = Number(cfg.shadow.verticalOffset);
            if (!_.isUndefined(cfg.shadow.hide))
                config.shadow.hide = cfg.shadow.hide;
        }

         if (!_.isUndefined(cfg.level)) {
            if (!_.isUndefined(cfg.level.colors))
                config.level.colors = cfg.level.colors;
            if (!_.isUndefined(cfg.level.counter))
                config.level.counter = cfg.level.counter;
            if (!_.isUndefined(cfg.level.customSectors))
                config.level.customSectors = cfg.level.customSectors;
        }

        if (!_.isUndefined(cfg.animation)) {
            if (!_.isUndefined(cfg.animation.startTime))
                config.animation.startTime = Number(cfg.animation.startTime);
            if (!_.isUndefined(cfg.animation.startType))
                config.animation.startType = cfg.animation.startType;
            if (!_.isUndefined(cfg.animation.refreshTime))
                config.animation.refreshTime = Number(cfg.animation.refreshTime);
            if (!_.isUndefined(cfg.animation.refreshType))
                config.animation.refreshType = cfg.animation.refreshType;
        }

        if (!_.isUndefined(cfg.donut)) {
            if (!_.isUndefined(cfg.donut.startAngle))
                config.donut.startAngle = Number(cfg.donut.startAngle);
        }

        setValueInRange();
    }

    function getCenteringTransform(rc) {
        return 'translate(' + (rc.width/2) + ',' + (rc.height/2) + ')';
    }

    function getRadius(rc) {
        return Math.min(rc.height, rc.width) / 2 - Math.floor(config.gauge.widthScale*100) * 2;
    }

    function setValueInRange() {
        if (config.value.val > config.value.max)
            config.value.val = config.value.max;
        if (config.value.val < config.value.min)
            config.value.val = config.value.min;
    }

    function humanFriendlyNumber(n, d) {
        var p, d2, i, s;

        p = Math.pow;
        d2 = p(10, d);
        i = 7;
        while (i) {
            s = p(10,i--*3);
            if (s <= n)
                n = Math.round(n*d2/s)/d2+"KMGTPE"[i];
        }
        return n;
    }

    function calcValueFontSize(r) {
        return (5*r/102.5).toFixed(2);
    }

    function calcAttributes(radius) {
        var attr = {
            value: {
                fontsize: '',
                offsetY: 0
            }
        };

        if (config.gauge.shape === 0) {
            attr.value.fontsize = calcValueFontSize(radius) + 'em';
            attr.value.offsetY = -radius+radius*0.2;
        }
    }

    function createD3() {
        var rc = parentNode.getBoundingClientRect();

        d3var.svg = d3.select('#' + config.bindto)
            .append('svg')
            .attr('width', rc.width)
            .attr('height', rc.height);

        d3var.center = d3var.svg.append('g')
            .attr('transform', getCenteringTransform(rc));

        var r = getRadius(rc);

        attributes = calcAttributes(r);

        d3var.value = d3var.center.append('text')
            .text('0')
            .style('fill', config.value.color)
            .style('text-anchor', 'middle')
            .attr('dy', '.3em')
            .attr('font-size', calcValueFontSize(r) + 'em')
            .attr('class', config.value.class);
    }

    function resize() {
        if (_.isUndefined(d3var.svg))
            return;

        var rc = parentNode.getBoundingClientRect();

        d3var.svg.attr('height', rc.height);
        d3var.svg.attr('width', rc.width);

        d3var.center.attr('transform', getCenteringTransform(rc));
    }

    function refresh(val, max) {
        d3var.value.transition()
            .duration(500)
            .tween('text', function() {
                var i = d3.interpolate(this.textContent,
                        humanFriendlyNumber(newValue, config.humanFriendlyDecimal));
                return function(t) {
                    this.textContent = i(t);
                };
            });
    }

    // Public API
    return {
        resize: function() {
            resize();
        },

        refresh: function(val, max) {
            refresh(val, max);
        }
    }
}