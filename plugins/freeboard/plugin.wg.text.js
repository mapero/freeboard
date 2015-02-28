// ┌─────────────────────────────────────────┐ \\
// │ F R E E B O A R D                                                                │ \\
// ├─────────────────────────────────────────┤ \\
// │ Copyright © 2013 Jim Heising (https://github.com/jheising)                       │ \\
// │ Copyright © 2013 Bug Labs, Inc. (http://buglabs.net)                             │ \\
// │ Copyright © 2015 Daisuke Tanaka (https://github.com/tanaka0323)                  │ \\
// ├─────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                                  │ \\
// └─────────────────────────────────────────┘ \\

(function() {
	'use strict';

	freeboard.addStyle('.tw-tooltip',
			'position: absolute;' +
			'font-size: 0.7em;' +
			'color: white;' +
			'text-align: center;' +
			'height: 20px;' +
			'padding: 2px 8px 2px 8px;' +
			'background: black;' +
			'opacity: 0.8;' +
			'border: solid 1px #fff;' +
			'pointer-events: none;' +
			'-webkit-box-shadow: 0 0 5px #000;' +
			'-moz-box-shadow: 0 0 5px #000;' +
			'box-shadow: 0 0 5px #000;'
			);

	var textWidget = function (settings) {
		var self = this;
		var BLOCK_HEIGHT = 60;
		var PADDING = 10;

		var currentSettings = settings;

		var currentID = _.uniqueId('textwidget_');
		var titleElement = $('<h2 class="section-title"></h2>');
		var widgetElement = $('<div class="text-widget" id="' + currentID + '"></div>');

		var option = {
			fontColor: '#d3d4d4',
			decimal: 0,
			comma: 0,
			metricPrefix: false,
			transition: {
				enable: true,
				type: 'circle-out',
				duration: 500
			},
			chart: {
				type: 'line',
				margin: { left: 3, right: 3, bottom: 5 },
				transition: {
					type: 'circle-out',
					duration: 500
				},
				lineWidth: 2,
				spotsize: 3.3,
				color: '#ff9900',
				spotcolor: {
					def: '#FF0000',
					max: '#0496ff',
					min: '#0496ff'
				}
			}
		};

		var d3var = {
			svg: null,
			gText: null,
			gChart: null,
			textValue: null,
			textUnits: null,
			chart: {
				minValIndex: -1,
				maxValIndex: -1,
				highlightIndex: -1,
				height: 0,
				width: 0,
				xTickcount: 100,
				xScale: null,
				xRevScale: null,
				yScale: null,
				line: null,
				area: null,
				data: null,
				gTooltip: null,
			}
		};

		function getFontSize() {
			return (currentSettings.size === 'big') ? '4.3em' : '1.95em';
		}

		function getUnitDy() {
			return (currentSettings.size === 'big') ? '1.4em' : '.6em';
		}

		function getTextY(height) {
			if (currentSettings.size === 'big')
				return (currentSettings.chart === true) ? (height/2.5) : height/2;
			else
				return (currentSettings.chart === true) ? (height/3) : height/2;
		}

		function getText(value) {
			var text;
			if (_.isNumber(value)) {
				if (option.metricPrefix) {
					var prefix = d3.formatPrefix(value);
					text = prefix.scale(value).toFixed(option.decimal) + prefix.symbol;
				} else {
					var f;
					if (option.comma === true)
						f = d3.format(',.' + option.decimal + 'f');
					else
						f = d3.format('.' + option.decimal + 'f');
					text = f(value);
				}
			} else {
				text = value;
			}
			return text;
		}

		function getChartHeight(rc) {
			return rc.height/3;
		}

		function getChartWidth(rc) {
			return rc.width - (option.chart.margin.left + option.chart.margin.right);
		}

		function getChartTranslateText(rc) {
			var transX = option.chart.margin.left;
			var transY = rc.height - d3var.chart.height - option.chart.margin.bottom;
			return 'translate(' + transX + ', ' + transY + ')';
		}

		function getChartForPath() {
			var chart;
			switch (option.chart.type) {
			case 'line':
				chart = d3var.chart.line;
				break;
			case 'area':
				chart = d3var.chart.area;
				break;
			default:
				chart = d3var.chart.line;
				break;
			}
			return chart;
		}

		function resize() {
			if (_.isNull(d3var.svg))
				return;

			var rc = widgetElement[0].getBoundingClientRect();

			d3var.svg.attr('height', rc.height);
			d3var.svg.attr('width', rc.width);

			d3var.gText.attr('transform', 'translate(0,' + getTextY(rc.height) + ')');

			if (currentSettings.chart) {
				d3var.chart.height = getChartHeight(rc);
				d3var.chart.width = getChartWidth(rc);

				d3var.chart.xScale.range([0, d3var.chart.width]);
				d3var.chart.yScale.range([d3var.chart.height, 0]);

				d3var.chart.xRevScale.domain(d3var.chart.xScale.range());

				d3var.gChart.attr('transform', getChartTranslateText(rc));

				d3var.gChart.select('path')
						.attr('d', getChartForPath())
						.attr('transform', null);

				d3var.gChart.select('rect')
						.attr('width', d3var.chart.width)
						.attr('height', d3var.chart.height);

				d3var.gChart.selectAll('circle')
						.attr({
							cx: function(d, i) { return d3var.chart.xScale(i); },
							cy: function(d, i) { return d3var.chart.yScale(d); },
						});
			}
		}

		function createChart(rc) {
			destroyChart();

			d3var.chart.height = getChartHeight(rc);
			d3var.chart.width = getChartWidth(rc);

			var _highlightSpot = function(x, show) {
				var _hide = function(idx) {
					if (d3var.chart.highlightIndex === -1)
						return;
					if (idx === d3var.chart.minValIndex || idx === d3var.chart.maxValIndex) {
						var clr = (idx === d3var.chart.minValIndex) ? option.chart.spotcolor.min : option.chart.spotcolor.max;
						d3.select(d3var.gChart.selectAll('circle')[0][idx])
									.attr('fill', clr);
						return;
					}
					d3.select(d3var.gChart.selectAll('circle')[0][idx]).style('display', 'none');
				};

				if (show) {
					_hide(d3var.chart.highlightIndex);
					d3var.chart.highlightIndex = Math.round(d3var.chart.xRevScale(x));

					d3.select(d3var.gChart.selectAll('circle')[0][d3var.chart.highlightIndex])
									.style('display', 'block')
									.attr('fill', option.chart.spotcolor.def);
				} else {
					_hide(d3var.chart.highlightIndex);
					d3var.chart.highlightIndex = -1;
				}
			};

			var _showTooltip = function() {
				if (d3var.chart.highlightIndex === -1)
					return;
				d3var.gChart.gTooltip
							.style('left', (d3.event.pageX + 10) + 'px')
							.style('top', (d3.event.pageY - 28) + 'px')
							.style('display', 'inline');
			};

			var _hideTooltip = function() {
				d3var.gChart.gTooltip.style('display', 'none');
			};

			var _updateTooltip = function() {
				if (d3var.chart.highlightIndex === -1)
					return;

				var val = d3var.chart.data[d3var.chart.highlightIndex];

				d3var.gChart.gTooltip.html(getText(val) + ' ' + currentSettings.units)
							.style('left', (d3.event.pageX + 10) + 'px')
							.style('top', (d3.event.pageY - 28) + 'px');
			};

			d3var.chart.data = [];

			d3var.chart.xScale = d3.scale.linear()
				.domain([0, 1])
				.range([0, d3var.chart.width]);

			d3var.chart.xRevScale = d3.scale.linear()
				.domain(d3var.chart.xScale.range())
				.range(d3var.chart.xScale.domain());

			d3var.chart.yScale = d3.scale.linear()
				.domain([0, 1])
				.range([d3var.chart.height, 0]);

			d3var.gChart = d3var.svg.insert('g', 'g')
				.attr('transform', getChartTranslateText(rc));

			switch (option.chart.type) {
			case 'line':
				d3var.chart.line = d3.svg.line()
					.interpolate('linear')
					.x(function(d, i) { return d3var.chart.xScale(i); })
					.y(function(d, i) { return d3var.chart.yScale(d); });
				d3var.gChart.append('path')
						.datum(d3var.chart.data)
						.attr('d', d3var.chart.line)
						.attr('fill', 'none')
						.attr('stroke', option.chart.color)
						.attr('stroke-width', option.chart.lineWidth + 'px');
				break;
			case 'area':
				d3var.chart.area = d3.svg.area()
					.x(function(d, i) { return d3var.chart.xScale(i); })
					.y0(function(d, i) { return d3var.chart.yScale(0); })
					.y1(function(d, i) { return d3var.chart.yScale(d); });
				d3var.gChart.append('path')
							.datum(d3var.chart.data)
							.attr('d', d3var.chart.area)
							.attr('fill', option.chart.color);
				break;
			}

			d3var.gChart.append('rect')
					.attr('fill', 'none')
					.attr('pointer-events', 'all')
					.attr('width', d3var.chart.width)
					.attr('height', d3var.chart.height)
					.on('mousemove', function() {
						var m = d3.mouse(this);
						_highlightSpot(m[0], true);
						_updateTooltip();
					})
					.on('mouseover', function() {
						var m = d3.mouse(this);
						_highlightSpot(m[0], true);
						_showTooltip();
					})
					.on('mouseout', function() {
						var m = d3.mouse(this);
						_highlightSpot(m[0], false);
						_hideTooltip();
					});

			d3var.gChart.gTooltip = d3.select('body').append('div')
						.attr('class', 'tw-tooltip')
						.style('display', 'none');
		}

		function destroyChart() {
			if (_.isNull(d3var.gChart))
				return;
			d3var.chart.data = null;
			d3var.gChart.gTooltip.remove();
			d3var.gChart.remove();
			d3var.gChart = null;
		}

		function createWidget() {
			var rc = widgetElement[0].getBoundingClientRect();

			d3var.svg = d3.select('#' + currentID)
				.append('svg')
				.attr('width', rc.width)
				.attr('height', rc.height);

			d3var.gText = d3var.svg.append('g')
				.attr('transform', 'translate(0,' + getTextY(rc.height) + ')');

			d3var.textValue = d3var.gText.append('text')
				.data([{ value: 0 }])
				.attr('fill', option.fontColor)
				.attr('text-anchor', 'center')
				.attr('dy', '.3em')
				.attr('font-size', getFontSize())
				.attr('class', 'ultralight-text');

			d3var.textUnits = d3var.gText.append('text')
				.text(currentSettings.units)
				.attr('fill', option.fontColor)
				.attr('text-anchor', 'central')
				.attr('dy', getUnitDy())
				.attr('font-size', '1em')
				.attr('class', 'ultralight-text');

			if (currentSettings.chart)
				createChart(rc);
		}

		function moveTextUnits() {
			if (_.isNull(d3var.svg))
				return;
			d3var.textUnits.attr('x', d3var.textValue.node().getBBox().width + 10);
		}

		function valueTransition(val) {
			d3var.textValue.transition()
				.duration(option.transition.duration)
				.ease(option.transition.type)
				.tween('text', function(d) {
					var i = d3.interpolate(d.value, val);
					d.value = val;
					return function(t) {
						moveTextUnits();
						this.textContent = getText(i(t));
					};
				});
		}

		function chartTransition(val) {
			d3var.chart.data.push(val);

			var minval = d3.min(d3var.chart.data);
			var maxval = d3.max(d3var.chart.data);

			d3var.chart.xScale
				.domain([0, d3var.chart.data.length-1]);
			d3var.chart.yScale
				.domain([minval, maxval])
				.range([d3var.chart.height, 0]);
			d3var.chart.xRevScale
				.range(d3var.chart.xScale.domain());

			var _getSpotColor = function(d, i) {
				if (minval === d) {
					d3var.chart.minValIndex = i;
					return option.chart.spotcolor.min;
				} else if (maxval === d) {
					d3var.chart.maxValIndex = i;
					return option.chart.spotcolor.max;
				}
				return option.chart.spotcolor.def;
			};

			var _getSpotDisplay = function(d, i) {
				if (d3var.chart.highlightIndex === i)
					return 'block';
				if (minval === maxval)
					return 'none';
				if (minval === d || maxval === d)
					return 'block';
				return 'none';
			};

			d3var.gChart.selectAll('circle')
					.data(d3var.chart.data)
				.enter().insert('circle', 'rect')
					.style('display', 'none')
					.attr({
						cx: function(d, i) { return d3var.chart.xScale(i); },
						cy: function(d, i) { return d3var.chart.yScale(d); },
						r: option.chart.spotsize,
						fill: option.chart.spotcolor.def
					});

			if (d3var.chart.data.length > d3var.chart.xTickcount) {
				d3.transition()
					.duration(option.chart.transition.duration)
					.ease(option.chart.transition.type)
					.each(function () {
						d3var.gChart.select('path')
								.attr('d', getChartForPath())
								.attr('transform', null)
							.transition()
								.attr('transform', 'translate(' + d3var.chart.xScale(-1) + ')');

						// remove first circle
						d3var.gChart.select('circle').remove();

						d3var.gChart.selectAll('circle')
								.style('display', function(d, i) {
									return _getSpotDisplay(d, i);
								})
								.attr('fill', function(d, i) {
									return _getSpotColor(d, i);
								})
								.attr('cy', function(d, i) { return d3var.chart.yScale(d); })
							.transition()
								.attr('cx', function(d, i) { return d3var.chart.xScale(i); });
					});
			} else {
				d3.transition()
					.duration(option.chart.transition.duration)
					.ease(option.chart.transition.type)
					.each(function () {
						d3var.gChart.selectAll('circle')
							.style('display', function(d, i) {
								return _getSpotDisplay(d, i);
							})
							.attr('fill', function(d, i) {
								return _getSpotColor(d, i);
							})
							.transition()
								.attr('cx', function(d, i) { return d3var.chart.xScale(i); })
								.attr('cy', function(d, i) { return d3var.chart.yScale(d); });

						d3var.gChart.select('path').transition()
								.attr('d', getChartForPath());
					});
			}

			if (d3var.chart.data.length > d3var.chart.xTickcount)
				d3var.chart.data.shift();
		}

		function refresh(value) {
			if (option.transition.enable && _.isNumber(value))
				valueTransition(value);
			else
				d3var.textValue.text(getText(value));

			if (!_.isNull(d3var.gChart) && _.isNumber(value))
				chartTransition(value);
		}

		function setBlocks(blocks) {
			if (_.isUndefined(blocks))
				return;
			var titlemargin = (titleElement.css('display') === 'none') ? 0 : titleElement.outerHeight();
			var height = (BLOCK_HEIGHT) * blocks - PADDING - titlemargin;
			widgetElement.css({
				height: height + 'px',
				width: '100%'
			});
			resize();
		}

		this.render = function (element) {
			$(element).append(titleElement).append(widgetElement);
			titleElement.html((_.isUndefined(currentSettings.title) ? '' : currentSettings.title));
			setBlocks(self.getHeight());
			createWidget();
		};

		this.onSettingsChanged = function (newSettings) {
			option.decimal = newSettings.decimal;
			option.comma = newSettings.comma;
			option.metricPrefix = newSettings.metric_prefix;
			option.transition.enable = newSettings.animate;
			option.chart.type = newSettings.chart_type;
			option.chart.color = newSettings.chart_color;
			option.chart.spotcolor.min = option.chart.spotcolor.max = newSettings.chart_minmax_color;

			if (_.isNull(d3var.svg)) {
				currentSettings = newSettings;
				return;
			}

			titleElement.html((_.isUndefined(newSettings.title) ? '' : newSettings.title));
			if (_.isUndefined(newSettings.title) || newSettings.title === '')
				titleElement.css('display', 'none');
			else
				titleElement.css('display', 'block');

			if (currentSettings.chart !== newSettings.chart ||
				currentSettings.chart_type !== newSettings.chart_type) {
				if (newSettings.chart || currentSettings.chart_type !== newSettings.chart_type)
					createChart(widgetElement[0].getBoundingClientRect());
				else
					destroyChart();
			}

			var updateCalculate = false;
			if (currentSettings.value != newSettings.value)
				updateCalculate = true;

			currentSettings = newSettings;

			setBlocks(self.getHeight());

			d3var.textUnits.text(currentSettings.units);
			d3var.textUnits.attr('dy', getUnitDy());
			d3var.textValue.attr('font-size', getFontSize());
			moveTextUnits();

			if (currentSettings.chart) {
				switch (option.chart.type) {
				case 'line':
					d3var.gChart.select('path').attr('stroke', option.chart.color);
					break;
				case 'area':
					d3var.gChart.select('path').attr('fill', option.chart.color);
					break;
				}

				if (d3var.chart.minValIndex !== -1) {
					d3.select(d3var.gChart.selectAll('circle')[0][d3var.chart.minValIndex])
								.attr('fill', option.chart.spotcolor.min);
				}
				if (d3var.chart.maxValIndex !== -1) {
					d3.select(d3var.gChart.selectAll('circle')[0][d3var.chart.maxValIndex])
								.attr('fill', option.chart.spotcolor.max);
				}
			}

			return updateCalculate;
		};

		this.onCalculatedValueChanged = function (settingName, newValue) {
			if (settingName === 'value')
				refresh(newValue);
		};

		this.onSizeChanged = function() {
			resize();
		};

		this.onDispose = function () {
			if (!_.isNull(d3var.svg)) {
				destroyChart();
				d3var.gText.remove();
				d3var.gText = null;
				d3var.svg.remove();
				d3var.svg = null;
			}
		};

		this.getHeight = function () {
			return (currentSettings.size === 'big' || currentSettings.chart === true) ? 2 : 1;
		};

		this.onSettingsChanged(settings);
	};

	freeboard.loadWidgetPlugin({
		type_name: 'text_widget',
		display_name: 'テキスト',
		description: 'テキストと簡易チャートが表示できるウィジェットです。',
		external_scripts : [
			'plugins/thirdparty/d3.v3.min.js'
		],
		settings: [
			{
				name: 'title',
				display_name: 'タイトル',
				validate: 'optional,maxSize[100]',
				type: 'text',
				description: '最大100文字'
			},
			{
				name: 'size',
				display_name: 'テキストサイズ',
				type: 'option',
				options: [
					{
						name: 'レギュラー',
						value: 'regular'
					},
					{
						name: 'ビッグ',
						value: 'big'
					}
				]
			},
			{
				name: 'value',
				display_name: '値',
				validate: 'optional,maxSize[2000]',
				type: 'calculated',
				description: '最大2000文字'
			},
			{
				name: 'decimal',
				display_name: '表示小数点以下桁数',
				type: 'number',
				validate: 'required,custom[integer],min[0],max[20]',
				style: 'width:100px',
				default_value: 0
			},
			{
				name: 'comma',
				display_name: 'カンマ表示',
				type: 'boolean',
				default_value: false,
			},
			{
				name: 'metric_prefix',
				display_name: '国際単位系表示',
				type: 'boolean',
				default_value: false,
				description: '1000なら1Kのように値を短縮します。'
			},
			{
				name: 'units',
				display_name: '単位',
				validate: 'optional,maxSize[20]',
				type: 'text',
				style: 'width:150px',
				description: '最大20文字'
			},
			{
				name: 'animate',
				display_name: '値変化アニメーション',
				type: 'boolean',
				default_value: true
			},
			{
				name: 'chart',
				display_name: 'チャートを含む',
				type: 'boolean'
			},
			{
				name: 'chart_type',
				display_name: 'チャートタイプ',
				type: 'option',
				options: [
					{
						name: 'ライン',
						value: 'line'
					},
					{
						name: 'エリア',
						value: 'area'
					}
				]
			},
			{
				name: 'chart_color',
				display_name: 'チャート色',
				validate: 'required,custom[hexcolor]',
				type: 'color',
				default_value: '#ff9900',
				description: 'デフォルト色: #ff9900'
			},
			{
				name: 'chart_minmax_color',
				display_name: 'チャート最大最小値色',
				validate: 'required,custom[hexcolor]',
				type: 'color',
				default_value: '#0496ff',
				description: 'デフォルト色: #0496ff'
			}
		],
		newInstance: function (settings, newInstanceCallback) {
			newInstanceCallback(new textWidget(settings));
		}
	});
}());
