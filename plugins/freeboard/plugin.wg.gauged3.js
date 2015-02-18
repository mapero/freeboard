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

	var gaugeWidget = function (settings) {
		var self = this;
		var BLOCK_HEIGHT = 60;
		var TITLE_MARGIN = 7;

		var currentID = _.uniqueId('gauge-');
		var titleElement = $('<h2 class="section-title"></h2>');
		var gaugeElement = $('<div class="gauge-widget" id="' + currentID + '"></div>');
		var gauge;

		var currentSettings = settings;

		function setBlocks(blocks) {
			if (_.isUndefined(blocks))
				return;
			var height = BLOCK_HEIGHT * blocks - titleElement.outerHeight() - TITLE_MARGIN;
			gaugeElement.css({
				'height': height + 'px',
				'width': '100%'
			});
		}

		function createGauge() {
			currentSettings.shape = Number(currentSettings.shape);

			if (!_.isUndefined(gauge))
				gauge = null;

			gaugeElement.empty();

			var config = {
				bindto: currentID,
				value: {
					val: (_.isUndefined(currentSettings.min_value) ? 0 : currentSettings.min_value),
					min: (_.isUndefined(currentSettings.min_value) ? 0 : currentSettings.min_value),
					max: (_.isUndefined(currentSettings.max_value) ? 0 : currentSettings.max_value),
					color: currentSettings.value_fontcolor,
					class: 'ultralight-text'
				},
				gauge: {
					widthScale: currentSettings.gauge_widthscale/100.0,
					color: currentSettings.gauge_color,
					shape: currentSettings.shape
				},
				label: {
					text: currentSettings.units,
					color: currentSettings.value_fontcolor,
					class: 'ultralight-text'
				},
				level: {
					colors: [ currentSettings.gauge_lower_color, currentSettings.gauge_mid_color, currentSettings.gauge_upper_color ]
				},
				shadow: {
					hide: true
				}
			};

			gauge = new GaugeD3(config);

			gaugeElement.resize(_.debounce(function() {
				gauge.resize();
			}, 500));
		}

		this.render = function (element) {
			$(element).append(titleElement).append(gaugeElement);
			createGauge();
			setBlocks(currentSettings.blocks);
		}

		this.onSettingsChanged = function (newSettings) {
			if (titleElement.outerHeight() === 0) {
				currentSettings = newSettings;
				return;
			}
			titleElement.html((_.isUndefined(newSettings.title) ? '' : newSettings.title));
			setBlocks(newSettings.blocks);
			currentSettings = newSettings;
		}

		this.onCalculatedValueChanged = function (settingName, newValue) {
		}

		this.onDispose = function () {
			if (!_.isUndefined(gauge))
				gauge = null;
		}

		this.getHeight = function () {
			return 4;
		}

		this.onSettingsChanged(settings);
	};

	freeboard.loadWidgetPlugin({
		type_name: 'gauged3',
		display_name: 'ゲージD3',
		description: 'ゲージを表示するウィジェットです。',
		external_scripts : [
			'plugins/thirdparty/d3.v3.min.js',
			'plugins/thirdparty/gauged3.js'
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
				name: 'value',
				display_name: '値',
				validate: 'optional,maxSize[2000]',
				type: 'calculated',
				description: '最大2000文字'
			},
			{
				name: 'shape',
				display_name: '型',
				type: 'option',
				options: [
					{
						name: 'ハーフ',
						value: 0
					},
					{
						name: 'ファン',
						value: 1
					},
					{
						name: 'ドーナッツ',
						value: 2
					}
				]
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
				name: 'gauge_widthscale',
				display_name: 'ゲージ太さ',
				type: 'number',
				style: 'width:100px',
				validate: 'required,custom[integer],min[0],max[200]',
				default_value: 100,
				description: '0から200まで'
			},
			{
				name: 'min_value',
				display_name: '最小値',
				type: 'number',
				style: 'width:100px',
				validate: 'required,custom[number],min[-100000000],max[100000000]',
				default_value: 0,
				description: '数値のみ'
			},
			{
				name: 'max_value',
				display_name: '最大値',
				type: 'number',
				style: 'width:100px',
				validate: 'required,custom[number],min[-100000000],max[100000000]',
				default_value: 100,
				description: '最小値以上'
			}
		],
		newInstance: function (settings, newInstanceCallback) {
			newInstanceCallback(new gaugeWidget(settings));
		}
	});
}());
