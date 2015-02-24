// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ F R E E B O A R D                                                                                                                      │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2015 Daisuke Tanaka (https://github.com/tanaka0323)                                                                        │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                                                                                        │ \\
// └────────────────────────────────────────────────────────────────────┘ \\

(function() {
	'use strict';

	var gaugeWidget = function (settings) {
		var self = this;
		var BLOCK_HEIGHT = 60;

		var currentID = _.uniqueId('gauge-');
		var gaugeElement = $('<div class="gauge-widget" id="' + currentID + '"></div>');
		var gauge = null;

		var currentSettings = settings;

		function setBlocks(blocks) {
			if (_.isUndefined(blocks))
				return;
			var height = BLOCK_HEIGHT * blocks;
			gaugeElement.css({
				'height': height + 'px',
				'width': '100%'
			});
		}

		function createGauge() {
			if (!_.isNull(gauge))
				gauge = null;

			gaugeElement.empty();

			gauge = new GaugeD3({
				bindto: currentID,
				title: {
					text: currentSettings.title,
					color: currentSettings.value_fontcolor,
					class: 'ultralight-text'
				},
				value: {
					val: 0,
					min: (_.isUndefined(currentSettings.min_value) ? 0 : currentSettings.min_value),
					max: (_.isUndefined(currentSettings.max_value) ? 0 : currentSettings.max_value),
					color: currentSettings.value_fontcolor,
					decimal: currentSettings.decimal,
					humanFriendly: currentSettings.human_friendly,
					humanFriendlyDecimal: currentSettings.decimal,
					humanFriendlyMinMax: currentSettings.human_friendly,
					transition: currentSettings.animate,
					hideMinMax: currentSettings.show_minmax ? false : true,
					class: 'ultralight-text'
				},
				gauge: {
					widthScale: currentSettings.gauge_width/100,
					color: currentSettings.gauge_color,
					type: currentSettings.type
				},
				label: {
					text: currentSettings.units,
					color: currentSettings.value_fontcolor,
					class: 'ultralight-text'
				},
				level: {
					colors: [ currentSettings.gauge_lower_color, currentSettings.gauge_mid_color, currentSettings.gauge_upper_color ]
				}
			});

			gaugeElement.resize(_.debounce(function() {
				gauge.resize();
			}, 100));
		}

		this.render = function (element) {
			$(element).append(gaugeElement);
			setBlocks(currentSettings.blocks);
			createGauge();
		};

		this.onSettingsChanged = function (newSettings) {
			if (_.isNull(gauge)) {
				currentSettings = newSettings;
				return;
			}
			setBlocks(newSettings.blocks);

			var updateCalculate = false;

			if (currentSettings.title != newSettings.title ||
				currentSettings.type != newSettings.type ||
				currentSettings.value != newSettings.value ||
				currentSettings.decimal != newSettings.decimal ||
				currentSettings.human_friendly != newSettings.human_friendly ||
				currentSettings.animate != newSettings.animate ||
				currentSettings.units != newSettings.units ||
				currentSettings.value_fontcolor != newSettings.value_fontcolor ||
				currentSettings.gauge_upper_color != newSettings.gauge_upper_color ||
				currentSettings.gauge_mid_color != newSettings.gauge_mid_color ||
				currentSettings.gauge_lower_color != newSettings.gauge_lower_color ||
				currentSettings.gauge_color != newSettings.gauge_color ||
				currentSettings.gauge_width != newSettings.gauge_width ||
				currentSettings.show_minmax != newSettings.show_minmax ||
				currentSettings.min_value != newSettings.min_value ||
				currentSettings.max_value != newSettings.max_value) {
				updateCalculate = true;
				currentSettings = newSettings;
				createGauge();
			} else {
				currentSettings = newSettings;
			}
			return updateCalculate;
		};

		this.onCalculatedValueChanged = function (settingName, newValue) {
			if (!_.isNull(gauge))
				gauge.refresh(Number(newValue));
		};

		this.onDispose = function () {
			gauge = null;
		};

		this.getHeight = function () {
			return currentSettings.blocks;
		};

		this.onSettingsChanged(settings);
	};

	freeboard.loadWidgetPlugin({
		type_name: 'gauge',
		display_name: 'ゲージ',
		description: 'ゲージを表示するウィジェットです。',
		external_scripts : [
			'plugins/thirdparty/d3.v3.min.js',
			'plugins/thirdparty/gauged3.min.js'
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
				validate: 'required,custom[integer],min[4],max[10]',
				type: 'number',
				style: 'width:100px',
				default_value: 4,
				description: '1ブロック60ピクセル。10ブロックまで'
			},
			{
				name: 'type',
				display_name: '型',
				type: 'option',
				options: [
					{
						name: 'ハーフ',
						value: 'half'
					},
					{
						name: 'クオーター 左上',
						value: 'quarter-left-top'
					},
					{
						name: 'クオーター 右上',
						value: 'quarter-right-top'
					},
					{
						name: 'クオーター 左下',
						value: 'quarter-left-bottom'
					},
					{
						name: 'クオーター 右下',
						value: 'quarter-right-bottom'
					},
					{
						name: 'スリークオーター 左上',
						value: 'threequarter-left-top'
					},
					{
						name: 'スリークオーター 右上',
						value: 'threequarter-right-top'
					},
					{
						name: 'スリークオーター 左下',
						value: 'threequarter-left-bottom'
					},
					{
						name: 'スリークオーター 右下',
						value: 'threequarter-right-bottom'
					},
					{
						name: 'スリークオーター 下',
						value: 'threequarter-bottom'
					},
					{
						name: 'ドーナッツ',
						value: 'donut'
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
				name: 'human_friendly',
				display_name: '補助単位',
				type: 'boolean',
				default_value: false,
				description: '1000なら1Kのように値を見やすくします。'
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
				validate: 'optional,maxSize[20],custom[illegalEscapeChar]',
				style: 'width:150px',
				type: 'text',
				description: '最大20文字'
			},
			{
				name: 'value_fontcolor',
				display_name: '値フォント色',
				type: 'color',
				validate: 'required,custom[hexcolor]',
				default_value: '#d3d4d4',
				description: 'デフォルト色: #d3d4d4'
			},
			{
				name: 'gauge_upper_color',
				display_name: 'ゲージ色 Upper',
				type: 'color',
				validate: 'required,custom[hexcolor]',
				default_value: '#ff0000',
				description: 'デフォルト色: #ff0000'
			},
			{
				name: 'gauge_mid_color',
				display_name: 'ゲージ色 Mid',
				type: 'color',
				validate: 'required,custom[hexcolor]',
				default_value: '#f9c802',
				description: 'デフォルト色: #f9c802'
			},
			{
				name: 'gauge_lower_color',
				display_name: 'ゲージ色 Lower',
				type: 'color',
				validate: 'required,custom[hexcolor]',
				default_value: '#a9d70b',
				description: 'デフォルト色: #a9d70b'
			},
			{
				name: 'gauge_color',
				display_name: 'ゲージ背景色',
				type: 'color',
				validate: 'required,custom[hexcolor]',
				default_value: '#edebeb',
				description: 'デフォルト色: #edebeb'
			},
			{
				name: 'gauge_width',
				display_name: 'ゲージ太さ',
				type: 'number',
				style: 'width:100px',
				validate: 'required,custom[integer],min[0],max[100]',
				default_value: 50,
				description: '0から100まで'
			},
			{
				name: 'show_minmax',
				display_name: '最小最大値表示',
				type: 'boolean',
				default_value: true
			},
			{
				name: 'min_value',
				display_name: '最小値',
				type: 'number',
				style: 'width:100px',
				validate: 'required,custom[number],min[-100000000000],max[100000000000]',
				default_value: 0,
				description: '数値のみ'
			},
			{
				name: 'max_value',
				display_name: '最大値',
				type: 'number',
				style: 'width:100px',
				validate: 'required,custom[number],min[-100000000000],max[100000000000]',
				default_value: 100,
				description: '最小値以上'
			}
		],
		newInstance: function (settings, newInstanceCallback) {
			newInstanceCallback(new gaugeWidget(settings));
		}
	});
}());
