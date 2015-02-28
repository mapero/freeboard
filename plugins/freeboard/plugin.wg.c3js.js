// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ F R E E B O A R D                                                                                                                      │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2015 Daisuke Tanaka (https://github.com/tanaka0323)                                                                        │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                                                                                        │ \\
// └────────────────────────────────────────────────────────────────────┘ \\

(function() {
	'use strict';

	var c3jsWidget = function (settings) {
		var self = this;
		var BLOCK_HEIGHT = 60;
		var TITLE_MARGIN = 7;

		var currentID = _.uniqueId('c3js_');
		var titleElement = $('<h2 class="section-title"></h2>');
		var chartElement = $('<div id="' + currentID + '"></div>');
		var currentSettings;
		var chart = null;

		function setBlocks(blocks) {
			if (_.isUndefined(blocks))
				return;
			var height = BLOCK_HEIGHT * blocks - titleElement.outerHeight() - TITLE_MARGIN;
			chartElement.css({
				'max-height': height + 'px',
				'height': height + 'px',
				'width': '100%'
			});
			if (!_.isNull(chart))
				chart.resize();
		}

		function createWidget(data, chartsettings) {

			var options;

			// No need for the first load
			data = _.omit(data, '_op');

			Function.prototype.toJSON = Function.prototype.toString;

			if (!_.isUndefined(chartsettings.options)) {
				try {
					options = JSON.parse(chartsettings.options.replace(/'/g, '\\\"'), function(k,v) {
						var ret;
						var str = v.toString();
						if (str.indexOf('function') === 0)
							ret = eval('('+v+')');
						else if (str.indexOf('d3.') === 0)
							ret = eval('('+v+')');
						else
							ret = v;
						return ret;
					});
				} catch (e) {
					alert('チャートオプションが不正です。 ' + e);
					console.error(e);
					return;
				}
			}

			if (!_.isNull(chart)) {
				chartElement.resize(null);
				chart.destroy();
				chart = null;
			}

			var bind = {
				bindto: '#' + currentID,
			};
			options = _.merge(bind, _.merge(data, options));

			try {
				chart = c3.generate(options);
				chart.resize();
			} catch (e) {
				console.error(e);
				return;
			}
		}

		function destroyChart() {
			if (!_.isNull(chart)) {
				chart.destroy();
				chart = null;
			}
		}

		function plotData(data) {
			if (_.isNull(chart))
				return;

			var op = data._op;
			data = _.omit(data, '_op');

			try {
				switch (op) {
				case 'load':
					chart.load(data);
					break;
				case 'unload':
					chart.unload(data);
					break;
				case 'groups':
					chart.groups(data);
					break;
				case 'flow':
					chart.flow(data);
					break;
				case 'data.names':
					chart.data.names(data);
					break;
				case 'data.colors':
					chart.data.colors(data);
					break;
				case 'axis.labels':
					chart.axis.labels(data);
					break;
				case 'axis.max':
					chart.axis.max(data);
					break;
				case 'axis.min':
					chart.axis.min(data);
					break;
				case 'axis.range':
					chart.axis.range(data);
					break;
				case 'xgrids':
					if (!_.isUndefined(data.xgrids))
						chart.xgrids(data.xgrids);
					break;
				case 'xgrids.add':
					if (!_.isUndefined(data.xgrids))
						chart.xgrids.add(data.xgrids);
					break;
				case 'xgrids.remove':
					if (!_.isUndefined(data.xgrids))
						chart.xgrids.remove(data.xgrids);
					else
						chart.xgrids.remove();
					break;
				case 'transform':
					if (!_.isUndefined(data.type)) {
						if (!_.isUndefined(data.name))
							chart.transform(data.type, data.name);
						else
							chart.transform(data.type);
					}
					break;
				default:
					chart.load(data);
					break;
				}
			} catch (e) {
				console.error(e);
			}
		}

		this.render = function (element) {
			$(element).append(titleElement).append(chartElement);
			titleElement.html((_.isUndefined(currentSettings.title) ? '' : currentSettings.title));
			setBlocks(currentSettings.blocks);
		};

		this.onSettingsChanged = function (newSettings) {
			if (titleElement.outerHeight() === 0) {
				currentSettings = newSettings;
				return;
			}
			titleElement.html((_.isUndefined(newSettings.title) ? '' : newSettings.title));

			setBlocks(newSettings.blocks);

			var updateCalculate = false;
			if (currentSettings.options != newSettings.options) {
				destroyChart();
				updateCalculate = true;
			}
			if (currentSettings.value != newSettings.value)
				updateCalculate = true;

			currentSettings = newSettings;
			return updateCalculate;
		};

		this.onCalculatedValueChanged = function (settingName, newValue) {
			if (!_.isObject(newValue))
				return;

			if (_.isNull(chart))
				createWidget(newValue, currentSettings);
			else
				plotData(newValue);
		};

		this.onDispose = function () {
			destroyChart();
		};

		this.onSizeChanged = function () {
			if (!_.isNull(chart))
				chart.resize();
		};

		this.getHeight = function () {
			return currentSettings.blocks;
		};

		this.onSettingsChanged(settings);
	};

	freeboard.loadWidgetPlugin({
		type_name: 'c3js',
		display_name: 'C3チャート',
		description: '様々な形式のチャートを表示するウィジェットです。詳細は <a href="http://c3js.org/" target="_blank">http://c3js.org/</a>',
		external_scripts : [
			'plugins/thirdparty/c3.min.js'
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
				name: 'blocks',
				display_name: '高さ (ブロック数)',
				validate: 'required,custom[integer],min[2],max[20]',
				type: 'number',
				style: 'width:100px',
				default_value: 4,
				description: '1ブロック60ピクセル。20ブロックまで'
			},
			{
				name: 'value',
				display_name: '値',
				validate: 'optional,maxSize[5000]',
				type: 'calculated',
				description: '最大5000文字'
			},
			{
				name: 'options',
				display_name: 'チャートオプション',
				validate: 'optional,maxSize[5000]',
				type: 'json',
				default_value: '{\n\
	"data": {\n\
		"type": "line"\n\
	}\n\
}',
				description: '最大5000文字 JSON形式文字列。'
			}
		],

		newInstance: function (settings, newInstanceCallback) {
			newInstanceCallback(new c3jsWidget(settings));
		}
	});
}());
