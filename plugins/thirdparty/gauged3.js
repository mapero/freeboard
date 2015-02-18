// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ GaugeD3                                                                                                                                │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2015 Daisuke Tanaka (https://github.com/tanaka0323)                                                                        │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                                                                                        │ \\
// └────────────────────────────────────────────────────────────────────┘ \\

GaugeD3 = function(config) {
    'use strict';

    var self = this;
    var version = { version: "1.0.0" };
    var cfg;

    var parentNode = null;

    // d3 variables
    var svg, center;

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

    cfg = default_config;

    // Initialize
    var ret = (function(config) {
        if (_.isNull(config) || _.isUndefined(config)) {
            console.error('GaugeD3: Make sure to pass options to the constructor!');
            return false;
        }
        if (_.isNull(config.bindto) == null || _.isUndefined(config.bindto)) {
            console.error('GaugeD3: No element with id : %s found', config.bindto);
            return false;
        }

        parentNode = document.getElementById(config.bindto);
        if (!parentNode) {
            console.error('GaugeD3: No element with id : %s found', config.bindto);
            return false;
        }

        setConfig(config);

        createSVG();
    }(config));

    if (ret === false)
        return null;

    function setConfig(config) {
        self.config.bindto = config.bindto;

        if (!_.isUndefined(config.title)) {
            if (!_.isUndefined(config.title.text))
                self.config.title.text = config.title.text;
            if (!_.isUndefined(config.title.color))
                self.config.title.color = config.title.color;
            if (!_.isUndefined(config.title.minFontSize))
                self.config.title.minFontSize = Number(config.title.minFontSize);
        }

        if (!_.isUndefined(config.value)) {
            if (!_.isUndefined(config.value.val))
                self.config.value.val = Number(config.value.val);
            if (!_.isUndefined(config.value.color))
                self.config.value.color = config.value.color;
            if (!_.isUndefined(config.value.symbol))
                self.config.value.symbol = config.value.symbol;
            if (!_.isUndefined(config.value.min))
                self.config.value.min = Number(config.value.min);
            if (!_.isUndefined(config.value.max))
                self.config.value.max = Number(config.value.max);
            if (!_.isUndefined(config.value.humanFriendlyDecimal))
                self.config.value.humanFriendlyDecimal = Number(config.value.humanFriendlyDecimal);
            if (!_.isUndefined(config.value.minFontSize))
                self.config.value.minFontSize = Number(config.value.minFontSize);
            if (!_.isUndefined(config.value.minMinFontSize))
                self.config.value.minMinFontSize = Number(config.value.minMinFontSize);
            if (!_.isUndefined(config.value.maxMinFontSize))
                self.config.value.maxMinFontSize = Number(config.value.maxMinFontSize);
            if (!_.isUndefined(config.value.hide))
                self.config.value.hide = config.value.hide;
            if (!_.isUndefined(config.value.hideMinMax))
                self.config.value.hideMinMax = config.value.hideMinMax;
            if (!_.isUndefined(config.value.humanFriendlyMinMax))
                self.config.value.humanFriendlyMinMax = config.value.humanFriendlyMinMax;
            if (!_.isUndefined(config.value.decimals))
                self.config.value.decimals = Number(config.value.decimals);
            if (!_.isUndefined(config.value.formatNumber))
                self.config.value.formatNumber = config.value.formatNumber;
            if (!_.isUndefined(config.value.class))
                self.config.value.class = config.value.class;
        }

        if (!_.isUndefined(config.gauge)) {
            if (!_.isUndefined(config.gauge.widthScale))
                self.config.gauge.widthScale = Number(config.gauge.widthScale);
            if (!_.isUndefined(config.gauge.color))
                self.config.gauge.color = config.gauge.color;
            if (!_.isUndefined(config.gauge.noGradient))
                self.config.gauge.noGradient = config.gauge.noGradient;
            if (!_.isUndefined(config.gauge.shape))
                self.config.gauge.shape = Number(config.gauge.shape);
            if (!_.isUndefined(config.gauge.relativeSize))
                self.config.gauge.relativeSize = config.gauge.relativeSize;
        }

        if (!_.isUndefined(config.label)) {
            if (!_.isUndefined(config.label.text))
                self.config.label.text = Number(config.label.text);
            if (!_.isUndefined(config.label.color))
                self.config.label.color = config.label.color;
            if (!_.isUndefined(config.label.class))
                self.config.label.class = config.label.class;
            if (!_.isUndefined(config.label.minFontSize))
                self.config.label.minFontSize = Number(config.label.minFontSize);
        }

        if (!_.isUndefined(config.shadow)) {
            if (!_.isUndefined(config.shadow.opacity))
                self.config.shadow.opacity = Number(config.shadow.opacity);
            if (!_.isUndefined(config.shadow.size))
                self.config.shadow.size = Number(config.shadow.size);
            if (!_.isUndefined(config.shadow.verticalOffset))
                self.config.shadow.verticalOffset = Number(config.shadow.verticalOffset);
            if (!_.isUndefined(config.shadow.hide))
                self.config.shadow.hide = config.shadow.hide;
        }

         if (!_.isUndefined(config.level)) {
            if (!_.isUndefined(config.level.colors))
                self.config.level.colors = config.level.colors;
            if (!_.isUndefined(config.level.counter))
                self.config.level.counter = config.level.counter;
            if (!_.isUndefined(config.level.customSectors))
                self.config.level.customSectors = config.level.customSectors;
        }

        if (!_.isUndefined(config.animation)) {
            if (!_.isUndefined(config.animation.startTime))
                self.config.animation.startTime = Number(config.animation.startTime);
            if (!_.isUndefined(config.animation.startType))
                self.config.animation.startType = config.animation.startType;
            if (!_.isUndefined(config.animation.refreshTime))
                self.config.animation.refreshTime = Number(config.animation.refreshTime);
            if (!_.isUndefined(config.animation.refreshType))
                self.config.animation.refreshType = config.animation.refreshType;
        }

        if (!_.isUndefined(config.donut)) {
            if (!_.isUndefined(config.donut.startAngle))
                self.config.donut.startAngle = Number(config.donut.startAngle);
        }
    }

    function createSVG() {
        var rc = parentNode.getBoundingClientRect();

        svg = d3.select('#' + self.config.bindto)
            .append('svg')
            .attr('width', rc.width)
            .attr('height', rc.height);

        center = svg.append('g')
            .attr('transform', getCenteringTransform(rc));
    }

    function getCenteringTransform(rc) {
        return 'translate(' + (rc.width/2) + ',' + (rc.height/2) + ')'
    }

    function resize() {
        if (_.isUndefined(svg))
            return;

        var rc = parentNode.getBoundingClientRect();

        svg.attr('height', rc.height);
        svg.attr('width', rc.width);

        center.attr('transform', getCenteringTransform(rc));
    }

    // Public API
    return {
        resize : function() {
            resize();
        }
    }
}