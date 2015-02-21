// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ F R E E B O A R D                                                                                                                      │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2013 Jim Heising (https://github.com/jheising)                                                                             │ \\
// │ Copyright © 2013 Bug Labs, Inc. (http://buglabs.net)                                                                                   │ \\
// │ Copyright © 2015 Daisuke Tanaka (https://github.com/tanaka0323)                                                                        │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                                                                                        │ \\
// └────────────────────────────────────────────────────────────────────┘ \\

(function() {

	var SPARKLINE_HISTORY_LENGTH = 100;
	var SPARKLINE_COLORS = ['#FF9900', '#FFFFFF', '#B3B4B4', '#6B6B6B', '#28DE28', '#13F7F9', '#E6EE18', '#C41204', '#CA3CB8', '#0B1CFB'];

	function easeTransitionText(newValue, textElement, duration) {

		var currentValue = $(textElement).text();

		if (currentValue == newValue)
			return;

		if ($.isNumeric(newValue) && $.isNumeric(currentValue)) {
			var numParts = newValue.toString().split('.');
			var endingPrecision = 0;

			if (numParts.length > 1) {
				endingPrecision = numParts[1].length;
			}

			numParts = currentValue.toString().split('.');
			var startingPrecision = 0;

			if (numParts.length > 1) {
				startingPrecision = numParts[1].length;
			}

			jQuery({transitionValue: Number(currentValue), precisionValue: startingPrecision}).animate({transitionValue: Number(newValue), precisionValue: endingPrecision}, {
				duration: duration,
				step: function () {
					$(textElement).text(this.transitionValue.toFixed(this.precisionValue));
				},
				done: function () {
					$(textElement).text(newValue);
				}
			});
		}
		else {
			$(textElement).text(newValue);
		}
	}

	function addValueToSparkline(element, value) {
		var values = $(element).data().values;
		var valueMin = $(element).data().valueMin;
		var valueMax = $(element).data().valueMax;
		if (!values) {
			values = [];
			valueMin = undefined;
			valueMax = undefined;
		}

		var collateValues = function(val, plotIndex) {
			if(!values[plotIndex]) {
				values[plotIndex] = [];
			}
			if (values[plotIndex].length >= SPARKLINE_HISTORY_LENGTH) {
				values[plotIndex].shift();
			}
			values[plotIndex].push(Number(val));

			if(_.isUndefined(valueMin) || val < valueMin) {
				valueMin = val;
			}
			if(_.isUndefined(valueMax) || val > valueMax) {
				valueMax = val;
			}
		};

		if(_.isArray(value)) {
			_.each(value, collateValues);
		} else {
			collateValues(value, 0);
		}
		$(element).data().values = values;
		$(element).data().valueMin = valueMin;
		$(element).data().valueMax = valueMax;

		var composite = false;
		_.each(values, function(valueArray, valueIndex) {
			$(element).sparkline(valueArray, {
				type: 'line',
				composite: composite,
				height: '100%',
				width: '100%',
				fillColor: false,
				lineColor: SPARKLINE_COLORS[valueIndex % SPARKLINE_COLORS.length],
				lineWidth: 2,
				spotRadius: 3,
				spotColor: false,
				minSpotColor: '#78AB49',
				maxSpotColor: '#78AB49',
				highlightSpotColor: '#9D3926',
				highlightLineColor: '#9D3926',
				chartRangeMin: valueMin,
				chartRangeMax: valueMax
			});
			composite = true;
		});
	}

	freeboard.addStyle('.tw-container', 'position:relative;');
	freeboard.addStyle('.tw-value', 'display:table-cell; vertical-align:middle;');
	freeboard.addStyle('.tw-value-block', 'display:table;');
	freeboard.addStyle('.tw-units', 'display:table-cell; padding-left: 10px; vertical-align:middle;');
	freeboard.addStyle('.tw-sparkline', 'position:absolute; height:20px; width:100%;');

	var textWidget = function (settings) {

		var self = this;
		var BLOCK_HEIGHT = 60;
		var TITLE_MARGIN = 7;

		var currentSettings = settings;
		var titleElement = $('<h2 class="section-title"></h2>');
		var containerElement = $('<div class="tw-container"></div>');
		var valueBlockElement = $('<div class="tw-value-block"></div>');
		var valueElement = $('<div class="tw-value ultralight-text"></div>');
		var unitsElement = $('<div class="tw-units"></div>');
		var sparklineElement = $('<div class="tw-sparkline"></div>');

		function recalcLayout() {
			var titlemargin;
			titlemargin = (titleElement.css('display') === 'none') ? 0 : titleElement.outerHeight();

			var height = BLOCK_HEIGHT * self.getHeight() - titlemargin - TITLE_MARGIN;
			containerElement.css({
				'height': height + 'px',
				'width': '100%'
			});

			var sparkmargin;
			sparkmargin = (sparklineElement.css('display') === 'none') ? 0 : sparklineElement.outerHeight();

			valueBlockElement.css({
				'height': height - sparkmargin + 'px'
			});

			var padding = 0.7;
			if (currentSettings.size === 'big') {
				padding = 3.0;
				if(currentSettings.sparkline)
					padding = 2.4;
			}
			unitsElement.css({
				'padding-top': padding + 'em'
			});
		}

		this.render = function (element) {
			$(element).empty();

			$(containerElement)
				.append($(valueBlockElement).append(valueElement).append(unitsElement))
				.append(sparklineElement);

			$(element).append(titleElement).append(containerElement);

			recalcLayout();
		};

		this.onSettingsChanged = function (newSettings) {

			var shouldDisplayTitle = (!_.isUndefined(newSettings.title) && newSettings.title !== '');
			if (shouldDisplayTitle) {
				titleElement.html(newSettings.title);
				titleElement.attr('style', null);
			} else {
				titleElement.empty();
				titleElement.hide();
			}

			if (newSettings.sparkline) {
				sparklineElement.attr('style', null);
			} else {
				delete sparklineElement.data().values;
				sparklineElement.empty();
				sparklineElement.hide();
			}

			var shouldDisplayUnits = (!_.isUndefined(newSettings.units) && newSettings.units !== '');
			if (shouldDisplayUnits) {
				unitsElement.html((_.isUndefined(newSettings.units) ? '' : newSettings.units));
				unitsElement.attr('style', null);
			} else {
				unitsElement.empty();
				unitsElement.hide();
			}

			var valueFontSize = 28;

			if (newSettings.size === 'big') {
				valueFontSize = 75;
				if(newSettings.sparkline)
					valueFontSize = 60;
			}
			valueElement.css({'font-size' : valueFontSize + 'px'});

			var updateCalculate = false;
			if (currentSettings.value != newSettings.value)
				updateCalculate = true;

			currentSettings = newSettings;

			recalcLayout();

			return updateCalculate;
		};

		this.onCalculatedValueChanged = function (settingName, newValue) {
			if (settingName === 'value') {
				if (currentSettings.animate)
					easeTransitionText(newValue, valueElement, 500);
				else
					valueElement.text(newValue);

				if (currentSettings.sparkline)
					addValueToSparkline(sparklineElement, newValue);
			}
		};

		this.onDispose = function () {

		};

		this.getHeight = function () {
			return (currentSettings.size === 'big' || currentSettings.sparkline) ? 2 : 1;
		};

		this.onSettingsChanged(settings);
	};

	freeboard.loadWidgetPlugin({
		type_name: 'text_widget',
		display_name: 'テキスト',
		description: 'テキストと簡易チャートが表示できるウィジェットです。',
		external_scripts : [
			'plugins/thirdparty/jquery.sparkline.min.js'
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
			newInstanceCallback(new textWidget(settings));
		}
	});
}());
