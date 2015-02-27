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
			'font-size: 0.8em;' +
			'color: white;' +
			'text-align: center;' +
			'width: 60px;' +
			'height: 20px;' +
			'padding: 2px;' +
			'background: black;' +
			'opacity: 0.8;' +
			'border: solid 1px #fff;' +
			'pointer-events: none;' +
			'-webkit-box-shadow: 0 0 2px #000;' +
			'box-shadow: 0 0 2px #000;'
			);

	var textWidgetD3 = function (settings) {
		var self = this;
		var BLOCK_HEIGHT = 60;
		var PADDING = 10;
		var FONT_COLOR = '#d3d4d4';

		var currentSettings = settings;

		var currentID = _.uniqueId('textwidget_');
		var titleElement = $('<h2 class="section-title"></h2>');
		var widgetElement = $('<div class="text-widget" id="' + currentID + '"></div>');

		var d3var = {
			svg: null,
			gText: null,
			gSparkline: null,
			textValue: null,
			textUnits: null,
			transition: {
				type: 'circle-out',
				duration: 500
			},
			spl: {
				margin: { bottom: 5 },
				highlightIndex: -1,
				transition: {
					type: 'circle-out',
					duration: 500
				},
				lineWidth: 2,
				spotsize: 3.5,
				spotcolor: {
					max: '#0496ff',
					min: '#0496ff'
				},
				height: 0,
				xTickcount: 100,
				xScale: null,
				xRevScale: null,
				yScale: null,
				line: null,
				data: null,
				gTooltip: null,
			}
		};

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

		function getFontSize() {
			return (currentSettings.size === 'big') ? '4.3em' : '2em';
		}

		function getUnitDy() {
			return (currentSettings.size === 'big') ? '1.8em' : '.6em';
		}

		function getTextY(height) {
			return (currentSettings.sparkline === true) ? (height/2.5) : height/2;
		}

		function getSparklineHeight(rc) {
			return rc.height/3.5;
		}

		function resize() {
			if (_.isNull(d3var.svg))
				return;

			var rc = widgetElement[0].getBoundingClientRect();

			d3var.svg.attr('height', rc.height);
			d3var.svg.attr('width', rc.width);

			d3var.gText.attr('transform', 'translate(0,' + getTextY(rc.height) + ')');

			var height = rc.height/2;

			if (currentSettings.sparkline) {
				d3var.spl.xScale.range([0, rc.width]);
				d3var.spl.height = getSparklineHeight(rc);
				d3var.spl.yScale.range([d3var.spl.height, 0]);

				d3var.spl.xRevScale.domain(d3var.spl.xScale.range());

				var transY = rc.height - d3var.spl.height - d3var.spl.margin.bottom;
				d3var.gSparkline.attr('transform', 'translate(0,' + transY + ')');

				d3var.gSparkline.select('path')
						.attr('d', d3var.spl.line)
						.attr('transform', null);

				d3var.gSparkline.select('rect')
						.attr('width', rc.width)
						.attr('height', d3var.spl.height);
			}
		}

		function createSparkline(rc) {
			d3var.spl.height = getSparklineHeight(rc);

			var _highlightSpot = function(x, flg) {
				var _hide = function(idx) {
					if (idx > -1)
						$(d3.selectAll('circle')[0][idx]).css('display', 'none');
				};

				if (flg) {
					_hide(d3var.spl.highlightIndex);
					d3var.spl.highlightIndex = Math.round(d3var.spl.xRevScale(x));
					$(d3.selectAll('circle')[0][d3var.spl.highlightIndex]).css('display', 'block');
				} else {
					_hide(d3var.spl.highlightIndex);
					d3var.spl.highlightIndex = -1;
				}
			};

			var _showTooltip = function() {
				d3var.gSparkline.gTooltip
							.style('left', (d3.event.pageX) + 'px')
							.style('top', (d3.event.pageY - 30) + 'px')
							.style('display', 'block');
			};

			var _hideTooltip = function() {
				d3var.gSparkline.gTooltip.style('display', 'none');
			};

			var _updateTooltip = function() {
				var val = (function() {
					if (d3var.spl.highlightIndex === -1)
						return 0;
					return d3var.spl.data[d3var.spl.highlightIndex];
				})();

				var f = d3.format('0,000');
				d3var.gSparkline.gTooltip.html(f(val) + ' ' + currentSettings.units)
							.style('left', (d3.event.pageX) + 'px')
							.style('top', (d3.event.pageY - 30) + 'px');
			};

			d3var.spl.data = [];

			d3var.spl.xScale = d3.scale.linear()
				.domain([0, 1])
				.range([0, rc.width]);

			d3var.spl.xRevScale = d3.scale.linear()
				.domain(d3var.spl.xScale.range())
				.range(d3var.spl.xScale.domain());

			d3var.spl.yScale = d3.scale.linear()
				.domain([0, 1])
				.range([d3var.spl.height, 0]);

			var transY = rc.height - d3var.spl.height - d3var.spl.margin.bottom;
			d3var.gSparkline = d3var.svg.insert('g', 'g')
					.attr('transform', 'translate(0, ' + transY + ')');

			d3var.spl.line = d3.svg.line()
				.interpolate('linear')
				.x(function(d, i) { return d3var.spl.xScale(i); })
				.y(function(d, i) { return d3var.spl.yScale(d); });

			d3var.gSparkline.append('path')
					.datum(d3var.spl.data)
					.attr('d', d3var.spl.line)
					.attr('fill', 'none')
					.attr('stroke', currentSettings.sparkline_color)
					.attr('stroke-width', d3var.spl.lineWidth + 'px');

			d3var.gSparkline.append('rect')
					.attr('fill', 'none')
					.attr('pointer-events', 'all')
					.attr('width', rc.width)
					.attr('height', d3var.spl.height)
					.on('mousemove', function(d, i) {
						var m = d3.mouse(this);
						_highlightSpot(m[0], true);
						_updateTooltip();
					})
					.on('mouseover', function(d, i) {
						_showTooltip();
					})
					.on('mouseout', function(d, i) {
						var m = d3.mouse(this);
						_highlightSpot(m[0], false);
						_hideTooltip();
					});

			d3var.gSparkline.gTooltip = d3.select('body').append('div')
						.attr('class', 'tw-tooltip')
						.style('display', 'none');
		}

		function destroySparkline() {
			if (_.isNull(d3var.gSparkline))
				return;
			d3var.spl.data = null;
			d3var.gSparkline.remove();
			d3var.gSparkline = null;
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
				.attr('fill', FONT_COLOR)
				.attr('text-anchor', 'center')
				.attr('dy', '.3em')
				.attr('font-size', getFontSize())
				.attr('class', 'ultralight-text');

			d3var.textUnits = d3var.gText.append('text')
				.text(currentSettings.units)
				.attr('fill', FONT_COLOR)
				.attr('text-anchor', 'central')
				.attr('dy', getUnitDy())
				.attr('font-size', '1em')
				.attr('class', 'ultralight-text');

			if (currentSettings.sparkline)
				createSparkline(rc);
		}

		function moveTextUnits() {
			if (_.isNull(d3var.textUnits))
				return;
			d3var.textUnits.attr('x', d3var.textValue.node().getBBox().width + 10);
		}

		function valueTransition(val) {
			d3var.textValue.transition()
				.duration(d3var.transition.duration)
				.ease(d3var.transition.type)
				.tween('text', function(d) {
					var i = d3.interpolate(this.textContent, Number(val));
					return function(t) {
						moveTextUnits();
						this.textContent = i(t).toFixed(currentSettings.decimal);
					};
				});
		}

		function sparklineTransition(val) {
			d3var.spl.data.push(val);

			var minval = d3.min(d3var.spl.data);
			var maxval = d3.max(d3var.spl.data);

			d3var.spl.xScale
				.domain([0, d3var.spl.data.length-1]);
			d3var.spl.yScale
				.domain([minval, maxval])
				.range([d3var.spl.height, 0]);

			d3var.spl.xRevScale
				.range(d3var.spl.xScale.domain());

			var _getSpotColor = function(d) {
				if (minval === d)
					return d3var.spl.spotcolor.min;
				else if (maxval === d)
					return d3var.spl.spotcolor.max;
				return currentSettings.sparkline_color;
			};

			var _getSpotDisplay = function(d, i) {
				if (minval === d || maxval === d)
					return 'block';
				if (d3var.spl.highlightIndex === i)
					return 'block';
				return 'none';
			};

			var circles = d3var.gSparkline.selectAll('circle')
					.data(d3var.spl.data)
				.enter().insert('circle', 'rect')
					.style('display', 'none')
					.attr({
						cx: function(d, i) { return d3var.spl.xScale(i); },
						cy: function(d, i) { return d3var.spl.yScale(d); },
						r: d3var.spl.spotsize,
						fill: currentSettings.sparkline_color
					});

			if (d3var.spl.data.length > d3var.spl.xTickcount) {
				d3.transition()
					.duration(d3var.spl.transition.duration)
					.ease(d3var.spl.transition.type)
					.each(function () {
						d3var.gSparkline.select('path')
								.attr('d', d3var.spl.line)
								.attr('transform', null)
							.transition()
								.attr('transform', 'translate(' + d3var.spl.xScale(-1) + ')');

						// remove first circle
						d3var.gSparkline.select('circle').remove();

						d3var.gSparkline.selectAll('circle')
								.style('display', function(d, i) {
									return _getSpotDisplay(d, i);
								})
								.attr('fill', function(d, i) {
									return _getSpotColor(d);
								})
								.attr('cy', function(d, i) { return d3var.spl.yScale(d); })
							.transition()
								.attr('cx', function(d, i) { return d3var.spl.xScale(i); });
					});
			} else {
				d3.transition()
					.duration(d3var.spl.transition.duration)
					.ease(d3var.spl.transition.type)
					.each(function () {
						d3var.gSparkline.selectAll('circle')
							.style('display', function(d, i) {
								return _getSpotDisplay(d, i);
							})
							.attr('fill', function(d, i) {
								return _getSpotColor(d);
							})
							.transition()
								.attr('cx', function(d, i) { return d3var.spl.xScale(i); })
								.attr('cy', function(d, i) { return d3var.spl.yScale(d); });

						d3var.gSparkline.select('path').transition()
								.attr('d', d3var.spl.line);
					});
			}

			if (d3var.spl.data.length > d3var.spl.xTickcount)
				d3var.spl.data.shift();
		}

		this.render = function (element) {
			$(element).append(titleElement).append(widgetElement);
			titleElement.html((_.isUndefined(currentSettings.title) ? '' : currentSettings.title));
			setBlocks(self.getHeight());
			createWidget();
		};

		this.onSettingsChanged = function (newSettings) {
			if (_.isNull(d3var.svg)) {
				currentSettings = newSettings;
				return;
			}

			titleElement.html((_.isUndefined(newSettings.title) ? '' : newSettings.title));
			if (_.isUndefined(newSettings.title) || newSettings.title === '')
				titleElement.css('display', 'none');
			else
				titleElement.css('display', 'block');

			if (currentSettings.sparkline != newSettings.sparkline) {
				if (newSettings.sparkline)
					createSparkline(widgetElement[0].getBoundingClientRect());
				else
					destroySparkline();
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

			if (currentSettings.sparkline) {
				d3var.gSparkline.select('path').attr('stroke', currentSettings.sparkline_color);
			}

			return updateCalculate;
		};

		this.onCalculatedValueChanged = function (settingName, newValue) {
			if (settingName === 'value') {
				if (currentSettings.animate && _.isNumber(newValue))
					valueTransition(newValue);
				else
					d3var.textValue.text(newValue);

				if (currentSettings.sparkline && _.isNumber(newValue))
					sparklineTransition(newValue);
			}
		};

		this.onSizeChanged = function() {
			resize();
		};

		this.onDispose = function () {
			if (!_.isNull(d3var.svg)) {
				d3var.svg.remove();
				d3var.svg = null;
			}
		};

		this.getHeight = function () {
			return (currentSettings.size === 'big' || currentSettings.sparkline === true) ? 2 : 1;
		};

		this.onSettingsChanged(settings);
	};

	freeboard.loadWidgetPlugin({
		type_name: 'text_widgetd3',
		display_name: 'テキストD3',
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
				validate: 'required,custom[integer],min[0],max[4]',
				style: 'width:100px',
				default_value: 0
			},
			{
				name: 'sparkline',
				display_name: 'スパークラインチャートを含む',
				type: 'boolean'
			},
			{
				name: 'sparkline_color',
				display_name: 'スパークラインチャート色',
				validate: 'required,custom[hexcolor]',
				type: 'color',
				default_value: '#ff9900',
				description: 'デフォルト色: #ff9900'
			},
			{
				name: 'animate',
				display_name: '値変化アニメーション',
				type: 'boolean',
				default_value: true
			},
			{
				name: 'units',
				display_name: '単位',
				validate: 'optional,maxSize[20]',
				type: 'text',
				style: 'width:150px',
				description: '最大20文字'
			}
		],
		newInstance: function (settings, newInstanceCallback) {
			newInstanceCallback(new textWidgetD3(settings));
		}
	});
}());
