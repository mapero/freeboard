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
			vcenter: null,
			textValue: null,
			textUnits: null
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
			return (currentSettings.size === 'big') ? '6em' : '2em';
		}

		function resize() {
			if (_.isNull(d3var.svg))
				return;

			var rc = widgetElement[0].getBoundingClientRect();

			d3var.svg.attr('height', rc.height);
			d3var.svg.attr('width', rc.width);

			d3var.vcenter.attr('transform', 'translate(0,' + (rc.height/2) + ')');
		}

		function createWidget() {
			var rc = widgetElement[0].getBoundingClientRect();

			d3var.svg = d3.select('#' + currentID)
				.append('svg')
				.attr('width', rc.width)
				.attr('height', rc.height);

			d3var.vcenter = d3var.svg.append('g')
				.attr('transform', 'translate(0,' + (rc.height/2) + ')');

			d3var.textValue = d3var.vcenter.append('text')
				.style('fill', FONT_COLOR)
				.style('text-anchor', 'center')
				.attr('dy', '.3em')
				.attr('font-size', getFontSize())
				.attr('class', 'ultralight-text');

			d3var.textUnits = d3var.vcenter.append('text')
				.text(currentSettings.units)
				.style('fill', FONT_COLOR)
				.style('text-anchor', 'central')
				.attr('dy', '.6em')
				.attr('font-size', '1em')
				.attr('class', 'ultralight-text');
		}

		function valueTransition(val) {
			d3var.textValue.transition()
				.duration(500)
				.ease('circle-out')
				.tween('text', function(d) {
					var i = d3.interpolate(this.textContent, Number(val));
					return function(t) {
						d3var.textUnits.attr('x', d3var.textValue.node().getBBox().width + 10);
						this.textContent = i(t).toFixed(currentSettings.decimal);
					};
				});
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

			var updateCalculate = false;
			if (currentSettings.value != newSettings.value)
				updateCalculate = true;

			currentSettings = newSettings;

			setBlocks(self.getHeight());

			return updateCalculate;
		};

		this.onCalculatedValueChanged = function (settingName, newValue) {
			if (settingName === 'value') {
				if (currentSettings.animate && _.isNumber(newValue))
					valueTransition(newValue);
				else
					d3var.textValue.text(newValue);
			}
		};

		this.onSizeChanged = function() {
			resize();
		}

		this.onDispose = function () {

		};

		this.getHeight = function () {
			return (currentSettings.size === 'big' || currentSettings.sparkline) ? 2 : 1;
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
				display_name: '簡易チャートを含む',
				type: 'boolean'
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
