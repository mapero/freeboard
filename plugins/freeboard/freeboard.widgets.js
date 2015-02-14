// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ F R E E B O A R D                                                  │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2013 Jim Heising (https://github.com/jheising)         │ \\
// │ Copyright © 2013 Bug Labs, Inc. (http://buglabs.net)               │ \\
// │ Copyright © 2015 Daisuke Tanaka (https://github.com/tanaka0323)    │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                    │ \\
// └────────────────────────────────────────────────────────────────────┘ \\

(function () {
	var SPARKLINE_HISTORY_LENGTH = 100;
	var SPARKLINE_COLORS = ["#FF9900", "#FFFFFF", "#B3B4B4", "#6B6B6B", "#28DE28", "#13F7F9", "#E6EE18", "#C41204", "#CA3CB8", "#0B1CFB"];

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

			if(valueMin === undefined || val < valueMin) {
				valueMin = val;
			}
			if(valueMax === undefined || val > valueMax) {
				valueMax = val;
			}
		}

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
				type: "line",
				composite: composite,
				height: "100%",
				width: "100%",
				fillColor: false,
				lineColor: SPARKLINE_COLORS[valueIndex % SPARKLINE_COLORS.length],
				lineWidth: 2,
				spotRadius: 3,
				spotColor: false,
				minSpotColor: "#78AB49",
				maxSpotColor: "#78AB49",
				highlightSpotColor: "#9D3926",
				highlightLineColor: "#9D3926",
				chartRangeMin: valueMin,
				chartRangeMax: valueMax
			});
			composite = true;
		});
	}

	var valueStyle = freeboard.getStyleString("values");

	freeboard.addStyle('.widget-big-text', valueStyle + "font-size:75px;");
	freeboard.addStyle('.tw-container', 'position:relative;');
	freeboard.addStyle('.tw-value-block', 'display:table;')
	freeboard.addStyle('.tw-value', valueStyle + 'vertical-align:middle; display:table-cell; text-overflow: ellipsis;');
	freeboard.addStyle('.tw-units', 'display:table-cell; padding-left: 10px; vertical-align:middle;');
	freeboard.addStyle('.tw-sparkline', 'position:absolute; height:20px; width:100%;');

	var textWidget = function (settings) {

		var self = this;

		var currentSettings = settings;
		var titleElement = $('<h2 class="section-title"></h2>');
		var containerElement = $('<div class="tw-container"></div>');
		var valueBlockElement = $('<div class="tw-value-block"></div>');
		var valueElement = $('<div class="tw-value"></div>');
		var unitsElement = $('<div class="tw-units"></div>');
		var sparklineElement = $('<div class="tw-sparkline"></div>');

		function recalcLayout() {
			var titlemargin;
			titlemargin = (titleElement.css('display') == 'none') ? 0 : titleElement.outerHeight();

			var height = 60 * self.getHeight() - titlemargin - 10;
			containerElement.css({
				"height": height + "px",
				"width": "100%"
			});

			var sparkmargin;
			sparkmargin = (sparklineElement.css('display') == 'none') ? 0 : sparklineElement.outerHeight();

			valueBlockElement.css({
				"height": height - sparkmargin + "px"
			});

			var padding = 0.7;
			if (currentSettings.size == "big") {
				padding = 3.0;
				if(currentSettings.sparkline)
					padding = 2.4
			}
			unitsElement.css({
				"padding-top": padding + "em"
			});
		}

		this.render = function (element) {
			$(element).empty();

			$(containerElement)
				.append($(valueBlockElement).append(valueElement).append(unitsElement))
				.append(sparklineElement);

			$(element).append(titleElement).append(containerElement);

			recalcLayout();
		}

		this.onSettingsChanged = function (newSettings) {
			currentSettings = newSettings;

			var shouldDisplayTitle = (!_.isUndefined(newSettings.title) && newSettings.title != "");
			if (shouldDisplayTitle) {
				titleElement.html(newSettings.title);
				titleElement.attr("style", null);
			} else {
				titleElement.empty();
				titleElement.hide();
			}

			if (newSettings.sparkline) {
				sparklineElement.attr("style", null);
			} else {
				delete sparklineElement.data().values;
				sparklineElement.empty();
				sparklineElement.hide();
			}

			var shouldDisplayUnits = (!_.isUndefined(newSettings.units) && newSettings.units != "");
			if (shouldDisplayUnits) {
				unitsElement.html((_.isUndefined(newSettings.units) ? "" : newSettings.units));
				unitsElement.attr("style", null);
			} else {
				unitsElement.empty();
				unitsElement.hide();
			}

			var valueFontSize = 30;

			if (newSettings.size == "big") {
				valueFontSize = 75;
				if(newSettings.sparkline)
					valueFontSize = 60;
			}
			valueElement.css({"font-size" : valueFontSize + "px"});

			recalcLayout();
		}

		this.onCalculatedValueChanged = function (settingName, newValue) {
			if (settingName == "value") {
				if (currentSettings.animate)
					easeTransitionText(newValue, valueElement, 500);
				else
					valueElement.text(newValue);

				if (currentSettings.sparkline)
					addValueToSparkline(sparklineElement, newValue);
			}
		}

		this.onDispose = function () {

		}

		this.getHeight = function () {
			return (currentSettings.size == "big" || currentSettings.sparkline) ? 2 : 1;
		}

		this.onSettingsChanged(settings);
	};

	freeboard.loadWidgetPlugin({
		type_name: "text_widget",
		display_name: "テキスト",
		"external_scripts" : [
			"plugins/thirdparty/jquery.sparkline.min.js"
		],
		settings: [
			{
				name: "title",
				display_name: "タイトル",
				validate: "optional,maxSize[100]",
				type: "text",
				description: "最大100文字"
			},
			{
				name: "size",
				display_name: "サイズ",
				type: "option",
				options: [
					{
						name: "レギュラー",
						value: "regular"
					},
					{
						name: "ビッグ",
						value: "big"
					}
				]
			},
			{
				name: "value",
				display_name: "値",
				validate: "optional,maxSize[2000]",
				type: "calculated",
				description: "最大2000文字"
			},
			{
				name: "sparkline",
				display_name: "スパークラインを含む",
				type: "boolean"
			},
			{
				name: "animate",
				display_name: "値変化アニメーション",
				type: "boolean",
				default_value: true
			},
			{
				name: "units",
				display_name: "単位",
				validate: "optional,maxSize[20]",
				type: "text",
				style: "width:150px",
				description: "最大20文字"
			}
		],
		newInstance: function (settings, newInstanceCallback) {
			newInstanceCallback(new textWidget(settings));
		}
	});

	freeboard.addStyle('.gauge-widget-wrapper', "width:100%; height:214px; text-align:center;");
	freeboard.addStyle('.gauge-widget', "width:280px; height:100%; display:inline-block;");

	var gaugeWidget = function (settings) {
		var self = this;

		var currentID = _.uniqueId("gauge-");
		var titleElement = $('<h2 class="section-title"></h2>');
		var wrapperElement = $('<div class="gauge-widget-wrapper"></div>');
		var gaugeElement = $('<div class="gauge-widget" id="' + currentID + '"></div>');
		var gaugeObject;

		var currentSettings = settings;

		function createGauge() {
			currentSettings.shape = Number(currentSettings.shape);

			if (!_.isUndefined(gaugeObject))
				gaugeObject = null;

			gaugeElement.empty();

			gaugeObject = new JustGage({
				id: currentID,
				value: (_.isUndefined(currentSettings.min_value) ? 0 : currentSettings.min_value),
				min: (_.isUndefined(currentSettings.min_value) ? 0 : currentSettings.min_value),
				max: (_.isUndefined(currentSettings.max_value) ? 0 : currentSettings.max_value),
				label: currentSettings.units,
				showInnerShadow: false,
				shape: currentSettings.shape,
				levelColors: [ currentSettings.gauge_lower_color, currentSettings.gauge_mid_color, currentSettings.gauge_upper_color ],
				gaugeWidthScale: currentSettings.gauge_widthscale/100.0,
				gaugeColor: currentSettings.gauge_color,
				labelClass: "ultralight-text",
				labelFontColor: currentSettings.value_fontcolor,
				valueFontColor: currentSettings.value_fontcolor
			});
		}

		this.render = function (element) {
			$(element).append(titleElement).append(wrapperElement.append(gaugeElement));
			// for justgauge redraw bug.
			_.delay(function() {
				createGauge();
			}, 500);
		}

		this.onSettingsChanged = function (newSettings) {
			if (_.isUndefined(gaugeObject)) {
				titleElement.html((_.isUndefined(newSettings.title) ? "" : newSettings.title));
				currentSettings = newSettings;
				return;
			}
			currentSettings = newSettings;
			createGauge();
			titleElement.html((_.isUndefined(newSettings.title) ? "" : newSettings.title));
		}

		this.onCalculatedValueChanged = function (settingName, newValue) {
			if (!_.isUndefined(gaugeObject)) {
				gaugeObject.refresh(Number(newValue));
			}
		}

		this.onDispose = function () {
			if (!_.isUndefined(gaugeObject))
				gaugeObject = null;
		}

		this.getHeight = function () {
			return 4;
		}

		this.onSettingsChanged(settings);
	};

	freeboard.loadWidgetPlugin({
		type_name: "gauge",
		display_name: "ゲージ",
		"external_scripts" : [
			"plugins/thirdparty/raphael.2.1.0.min.js",
			"plugins/thirdparty/justgage.min.js"
		],
		settings: [
			{
				name: "title",
				display_name: "タイトル",
				validate: "optional,maxSize[100]",
				type: "text",
				description: "最大100文字"
			},
			{
				name: "value",
				display_name: "値",
				validate: "optional,maxSize[2000]",
				type: "calculated",
				description: "最大2000文字"
			},
			{
				name: "shape",
				display_name: "型",
				type: "option",
				options: [
					{
						name: "ハーフ",
						value: 0
					},
					{
						name: "ファン",
						value: 1
					},
					{
						name: "ドーナッツ",
						value: 2
					}
				]
			},
			{
				name: "units",
				display_name: "単位",
				validate: "optional,maxSize[20],custom[illegalEscapeChar]",
				style: "width:150px",
				type: "text",
				description: "最大20文字"
			},
			{
				name: "value_fontcolor",
				display_name: "値フォント色",
				type: "color",
				validate: "required,custom[hexcolor]",
				default_value: "#d3d4d4",
				description: "デフォルト色: #d3d4d4"
			},
			{
				name: "gauge_upper_color",
				display_name: "ゲージ色 Upper",
				type: "color",
				validate: "required,custom[hexcolor]",
				default_value: "#ff0000",
				description: "デフォルト色: #ff0000"
			},
			{
				name: "gauge_mid_color",
				display_name: "ゲージ色 Mid",
				type: "color",
				validate: "required,custom[hexcolor]",
				default_value: "#f9c802",
				description: "デフォルト色: #f9c802"
			},
			{
				name: "gauge_lower_color",
				display_name: "ゲージ色 Lower",
				type: "color",
				validate: "required,custom[hexcolor]",
				default_value: "#a9d70b",
				description: "デフォルト色: #a9d70b"
			},
			{
				name: "gauge_color",
				display_name: "ゲージ背景色",
				type: "color",
				validate: "required,custom[hexcolor]",
				default_value: "#edebeb",
				description: "デフォルト色: #edebeb"
			},
			{
				name: "gauge_widthscale",
				display_name: "ゲージ太さ",
				type: "number",
				style: "width:100px",
				validate: "required,custom[integer],min[0],max[200]",
				default_value: 100,
				description: "0から200まで"
			},
			{
				name: "min_value",
				display_name: "最小値",
				type: "number",
				style: "width:100px",
				validate: "required,custom[number],min[-100000000],max[100000000]",
				default_value: 0,
				description: "数値のみ"
			},
			{
				name: "max_value",
				display_name: "最大値",
				type: "number",
				style: "width:100px",
				validate: "required,custom[number],min[-100000000],max[100000000]",
				default_value: 100,
				description: "最小値以上"
			}
		],
		newInstance: function (settings, newInstanceCallback) {
			newInstanceCallback(new gaugeWidget(settings));
		}
	});

	freeboard.addStyle('.sparkline', "width:100%;height: 75px;");
	var sparklineWidget = function (settings) {
		var self = this;

		var titleElement = $('<h2 class="section-title"></h2>');
		var sparklineElement = $('<div class="sparkline"></div>');

		this.render = function (element) {
			$(element).append(titleElement).append(sparklineElement);
		}

		this.onSettingsChanged = function (newSettings) {
			titleElement.html((_.isUndefined(newSettings.title) ? "" : newSettings.title));
		}

		this.onCalculatedValueChanged = function (settingName, newValue) {
			addValueToSparkline(sparklineElement, newValue);
		}

		this.onDispose = function () {
		}

		this.getHeight = function () {
			return 2;
		}

		this.onSettingsChanged(settings);
	};

	freeboard.loadWidgetPlugin({
		type_name: "sparkline",
		display_name: "スパークラインチャート",
		"external_scripts" : [
			"plugins/thirdparty/jquery.sparkline.min.js"
		],
		settings: [
			{
				name: "title",
				display_name: "タイトル",
				validate: "optional,maxSize[100]",
				type: "text",
				description: "最大100文字"
			},
			{
				name: "value",
				display_name: "値",
				validate: "optional,maxSize[500]",
				type: "calculated",
				description: "最大500文字",
				multi_input: true
			}
		],
		newInstance: function (settings, newInstanceCallback) {
			newInstanceCallback(new sparklineWidget(settings));
		}
	});

	freeboard.addStyle('.pointer-widget', "width:100%;");

	var pointerWidget = function (settings) {
		var self = this;

		const CIRCLE_WIDTH = 3;

		var currentID = _.uniqueId("pointer_");
		var titleElement = $('<h2 class="section-title"></h2>');
		var widgetElement = $('<div class="pointer-widget" id="' + currentID + '"></div>');
		var currentSettings = settings;
		var fontcolor = freeboard.getStyleObject("values")['color'];

		// d3 variables
		var widgetRect;
		var τ = 2 * Math.PI
		var svg, arc, center, pointer, textValue, textUnits;

		function setBlocks(blocks) {
			if (_.isUndefined(blocks))
				return;
			var height = 60 * blocks - titleElement.outerHeight() - 7;
			widgetElement.css({
				"height": height + "px",
				"width": "100%"
			});
		}

		function polygonPath(points) {
			if (!points || points.length < 2)
				return [];
			var path;
			path = 'M'+points[0]+','+points[1];
			for (var i = 2; i < points.length; i += 2) {
				path += 'L'+points[i]+','+points[i+1];
			}
			path += 'Z';
			return path;
		}

		function getCenteringTransform(height, width) {
			return "translate(" + (width/2) + "," + (height/2) + ")"
		}

		function getArcR(height, width) {
			return Math.min(height, width) / 2 - CIRCLE_WIDTH * 2;
		}

		function calcValueFontSize(arcR) {
			return parseInt(arcR-35);
		}

		function getPointerPath(arcR) {
			return polygonPath([0, - arcR + CIRCLE_WIDTH, 15, -(arcR-20), -15, -(arcR-20)])
		}

		function resize() {
			if (_.isUndefined(svg))
				return;

			widgetRect = widgetElement[0].getBoundingClientRect();

			svg.attr("height", widgetRect.height);
			svg.attr("width", widgetRect.width);

			center.attr("transform", getCenteringTransform(widgetRect.height, widgetRect.width));

			var r = getArcR(widgetRect.height, widgetRect.width);

			arc.innerRadius(r-CIRCLE_WIDTH)
			arc.outerRadius(r);

			arc_bg.attr("d", arc);
			pointer.attr("d", getPointerPath(r));

			textValue.attr("font-size", calcValueFontSize(r) + "px");
			textUnits.attr("dy", parseInt(textValue.node().getBBox().height/2.1) + "px");
		}

		function createWidget() {

			widgetRect = widgetElement[0].getBoundingClientRect();

			svg = d3.select("#" + currentID)
				.append("svg")
				.attr("width", widgetRect.width)
				.attr("height", widgetRect.height);

			center = svg.append("g")
				.attr("transform", getCenteringTransform(widgetRect.height, widgetRect.width));

			var r = getArcR(widgetRect.height, widgetRect.width);
			arc = d3.svg.arc()
				.innerRadius(r-CIRCLE_WIDTH)
				.outerRadius(r)
				.startAngle(0);

			textValue = center.append("text")
				.text("0")
				.style("fill", fontcolor)
				.style("text-anchor", "middle")
				.attr("dy", ".3em")
				.attr("font-size", calcValueFontSize(r) + "px")
				.attr("class", "ultralight-text");

			textUnits = center.append("text")
				.text(currentSettings.units)
				.style("fill", fontcolor)
				.style("text-anchor", "middle")
				.attr("dy", parseInt(textValue.node().getBBox().height/2.1) + "px")
				.attr("font-size", "14px")
				.attr("class", "ultralight-text");

			arc_bg = center.append("path")
				.datum({endAngle: τ})
				.style("fill", currentSettings.circle_color)
				.attr("d", arc);

			pointer = center.append("path")
				.style("fill", currentSettings.pointer_color)
				.attr("d", getPointerPath(r));

			// svg chart fit to container
			widgetElement.resize(_.debounce(function() {
				resize();
			}, 500));
		}

		this.render = function (element) {
			$(element).append(titleElement).append(widgetElement);
			titleElement.html((_.isUndefined(currentSettings.title) ? "" : currentSettings.title));
			setBlocks(currentSettings.blocks);
			createWidget();
		}

		this.onSettingsChanged = function (newSettings) {
			if (_.isUndefined(svg)) {
				currentSettings = newSettings;
				return;
			}

			titleElement.html((_.isUndefined(newSettings.title) ? "" : newSettings.title));
			arc_bg.style("fill", newSettings.circle_color);
			pointer.style("fill", newSettings.pointer_color);
			textUnits.text((_.isUndefined(newSettings.units) ? "" : newSettings.units))
			setBlocks(newSettings.blocks);

			currentSettings = newSettings;
		}

		this.onCalculatedValueChanged = function (settingName, newValue) {
			if (_.isUndefined(svg))
				return;
			if (settingName == "direction") {
				pointer.transition()
					.duration(250)
					.ease("bounce")
					.attrTween("transform", function(d, i, a) {
						return d3.interpolateString(a, "rotate(" + parseInt(newValue) + ", 0, 0)");
					});
			} else if (settingName == "value_text") {
				if (_.isUndefined(newValue))
					return;
				textValue
					.transition()
					.duration(500)
					.tween("text", function() {
						var i = d3.interpolate(this.textContent, Number(newValue));
						return function(t) {
							this.textContent = i(t).toFixed(1);
						};
					});
			}
		}

		this.onDispose = function () {
			svg = arc_bg = arc = center = pointer = null;
		}

		this.getHeight = function () {
			return currentSettings.blocks;
		}

		this.onSettingsChanged(settings);
	};

	freeboard.loadWidgetPlugin({
		type_name: "pointer",
		display_name: "ポインタ",
		"external_scripts" : [
			"http://d3js.org/d3.v3.min.js",
		],
		settings: [
			{
				name: "title",
				display_name: "タイトル",
				validate: "optional,maxSize[100]",
				type: "text",
				description: "最大100文字"
			},
			{
				name: "blocks",
				display_name: "高さ (ブロック数)",
				validate: "required,custom[integer],min[4],max[10]",
				type: "number",
				style: "width:100px",
				default_value: 4,
				description: "1ブロック60ピクセル。10ブロックまで"
			},
			{
				name: "direction",
				display_name: "方向",
				validate: "optional,maxSize[2000]",
				type: "calculated",
				description: "最大2000文字<br>角度を入力して下さい。"
			},
			{
				name: "value_text",
				display_name: "値テキスト",
				validate: "optional,maxSize[2000]",
				type: "calculated",
				description: "最大2000文字"
			},
			{
				name: "units",
				display_name: "単位",
				validate: "optional,maxSize[20]",
				style: "width:150px",
				type: "text",
				description: "最大20文字"
			},
			{
				name: "circle_color",
				display_name: "サークル色",
				validate: "required,custom[hexcolor]",
				type: "color",
				default_value: "#ff9900",
				description: "デフォルト色: #ff9900"
			},
			{
				name: "pointer_color",
				display_name: "ポインタ色",
				validate: "required,custom[hexcolor]",
				type: "color",
				default_value: "#fff",
				description: "デフォルト色: #fff"
			}
		],
		newInstance: function (settings, newInstanceCallback) {
			newInstanceCallback(new pointerWidget(settings));
		}
	});

	freeboard.addStyle('.picture-widget', "background-size:contain; background-position:center; background-repeat: no-repeat;");

	var pictureWidget = function(settings) {
		var self = this;
		var widgetElement = $('<div class="picture-widget"></div>');
		var titleElement = $('<h2 class="section-title"></h2>');
		var currentSettings;
		var timer;
		var imageURL;

		function setBlocks(blocks) {
			if (_.isUndefined(blocks))
				return;
			var height = 60 * blocks - titleElement.outerHeight() - 7;
			widgetElement.css({
				"height": height + "px",
				"width": "100%"
			});
		}

		function stopTimer() {
			if (timer) {
				clearInterval(timer);
				timer = null;
			}
		}

		function updateImage() {
			if (widgetElement && imageURL) {
				var cacheBreakerURL = imageURL + (imageURL.indexOf("?") == -1 ? "?" : "&") + Date.now();

				$(widgetElement).css({
					"background-image" :  "url(" + cacheBreakerURL + ")"
				});
			}
		}

		this.render = function(element) {
			$(element).append(titleElement).append(widgetElement);
			titleElement.html((_.isUndefined(currentSettings.title) ? "" : currentSettings.title));
			setBlocks(currentSettings.blocks);
		}

		this.onSettingsChanged = function(newSettings) {
			if (titleElement.outerHeight() == 0) {
				currentSettings = newSettings;
				return;
			}
			stopTimer();

			if (newSettings.refresh && newSettings.refresh > 0)
				timer = setInterval(updateImage, Number(newSettings.refresh) * 1000);

			titleElement.html((_.isUndefined(newSettings.title) ? "" : newSettings.title));
			setBlocks(newSettings.blocks);
			currentSettings = newSettings;
		}

		this.onCalculatedValueChanged = function(settingName, newValue) {
			if (settingName == "src")
				imageURL = newValue;

			updateImage();
		}

		this.onDispose = function() {
			stopTimer();
		}

		this.getHeight = function() {
			return currentSettings.blocks;
		}

		this.onSettingsChanged(settings);
	};

	freeboard.loadWidgetPlugin({
		type_name: "picture",
		display_name: "画像",
		settings: [
			{
				name: "title",
				display_name: "タイトル",
				validate: "optional,maxSize[100]",
				type: "text",
				description: "最大100文字"
			},
			{
				name: "blocks",
				display_name: "高さ (ブロック数)",
				validate: "required,custom[integer],min[4],max[20]",
				type: "number",
				style: "width:100px",
				default_value: 4,
				description: "1ブロック60ピクセル。20ブロックまで"
			},
			{
				name: "src",
				display_name: "画像URL",
				validate: "optional,maxSize[2000]",
				type: "calculated",
				description: "最大2000文字"
			},
			{
				type: "number",
				display_name: "更新頻度",
				validate: "optional,custom[integer],min[1]",
				style: "width:100px",
				name: "number",
				suffix: "秒",
				description:"更新する必要がない場合は空白のまま"
			}
		],
		newInstance: function (settings, newInstanceCallback) {
			newInstanceCallback(new pictureWidget(settings));
		}
	});

	freeboard.addStyle('.indicator-light', "border-radius:50%;width:22px;height:22px;border:2px solid #3d3d3d;margin-top:5px;float:left;background-color:#222;margin-right:10px;");
	freeboard.addStyle('.indicator-light.on', "background-color:#FFC773;box-shadow: 0px 0px 15px #FF9900;border-color:#FDF1DF;");
	freeboard.addStyle('.indicator-text', "margin-top:10px;");
	var indicatorWidget = function (settings) {
		var self = this;
		var titleElement = $('<h2 class="section-title"></h2>');
		var stateElement = $('<div class="indicator-text"></div>');
		var indicatorElement = $('<div class="indicator-light"></div>');
		var currentSettings = settings;
		var isOn = false;

		function updateState() {
			indicatorElement.toggleClass("on", isOn);

			if (isOn) {
				stateElement.text((_.isUndefined(currentSettings.on_text) ? "" : currentSettings.on_text));
			}
			else {
				stateElement.text((_.isUndefined(currentSettings.off_text) ? "" : currentSettings.off_text));
			}
		}

		this.render = function (element) {
			$(element).append(titleElement).append(indicatorElement).append(stateElement);
		}

		this.onSettingsChanged = function (newSettings) {
			currentSettings = newSettings;
			titleElement.html((_.isUndefined(newSettings.title) ? "" : newSettings.title));
			updateState();
		}

		this.onCalculatedValueChanged = function (settingName, newValue) {
			if (settingName == "value") {
				isOn = Boolean(newValue);
			}

			updateState();
		}

		this.onDispose = function () {
		}

		this.getHeight = function () {
			return 1;
		}

		this.onSettingsChanged(settings);
	};

	freeboard.loadWidgetPlugin({
		type_name: "indicator",
		display_name: "インジケータライト",
		settings: [
			{
				name: "title",
				display_name: "タイトル",
				validate: "optional,maxSize[100]",
				type: "text",
				description: "最大100文字"
			},
			{
				name: "value",
				display_name: "値",
				validate: "optional,maxSize[2000]",
				type: "calculated",
				description: "最大2000文字"
			},
			{
				name: "on_text",
				display_name: "ON時テキスト",
				validate: "optional,maxSize[500]",
				type: "calculated",
				description: "最大500文字"
			},
			{
				name: "off_text",
				display_name: "OFF時テキスト",
				validate: "optional,maxSize[500]",
				type: "calculated",
				description: "最大500文字"
			}
		],
		newInstance: function (settings, newInstanceCallback) {
			newInstanceCallback(new indicatorWidget(settings));
		}
	});

	freeboard.addStyle('.gm-style-cc a', "text-shadow:none;");

	var googleMapWidget = function (settings) {
		var self = this;
		var currentSettings = settings;
		var map;
		var marker;
		var poly;
		var mapElement = $('<div></div>')
		var currentPosition = {};

		function updatePosition() {
			if (map && marker && currentPosition.lat && currentPosition.lon) {
				var newLatLon = new google.maps.LatLng(currentPosition.lat, currentPosition.lon);
				marker.setPosition(newLatLon);
				if (currentSettings.drawpath)
					poly.getPath().push(newLatLon);
				map.panTo(newLatLon);
			}
		}

		function setBlocks(blocks) {
			if (_.isUndefined(mapElement) || _.isUndefined(blocks))
				return;
			var height = 60 * blocks;
			mapElement.css({
				"height": height + "px",
				"width": "100%"
			});
		}

		function createWidget() {
			if (_.isUndefined(mapElement))
				return;

			function initializeMap() {
				var mapOptions = {
					zoom: 13,
					center: new google.maps.LatLng(37.235, -115.811111),
					disableDefaultUI: true,
					draggable: false
				};

				map = new google.maps.Map(mapElement[0], mapOptions);

				var polyOptions = {
					strokeColor: '#0091D1',
					strokeOpacity: 1.0,
					strokeWeight: 3
				};

				poly = new google.maps.Polyline(polyOptions);
				poly.setMap(map);

				google.maps.event.addDomListener(mapElement[0], 'mouseenter', function (e) {
					e.cancelBubble = true;
					if (!map.hover) {
						map.hover = true;
						map.setOptions({zoomControl: true});
					}
				});

				google.maps.event.addDomListener(mapElement[0], 'mouseleave', function (e) {
					if (map.hover) {
						map.setOptions({zoomControl: false});
						map.hover = false;
					}
				});

				marker = new google.maps.Marker({map: map});

				// map fitting to container
				mapElement.resize(_.debounce(function() {
					google.maps.event.trigger(mapElement[0], 'resize');
					updatePosition();
				}, 500));

				updatePosition();
			}

			if (window.google && window.google.maps) {
				initializeMap();
			} else {
				window.gmap_initialize = initializeMap;
				head.js("https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=gmap_initialize");
			}
		}

		this.render = function (element) {
			$(element).append(mapElement);
			setBlocks(currentSettings.blocks);
			createWidget();
		}

		this.onSettingsChanged = function (newSettings) {
			if (_.isUndefined(map)) {
				currentSettings = newSettings;
				return;
			}
			if (newSettings.blocks != currentSettings.blocks)
				setBlocks(newSettings.blocks);
			if (!newSettings.drawpath)
				poly.getPath().clear();
			currentSettings = newSettings;
		}

		this.onCalculatedValueChanged = function (settingName, newValue) {
			if (settingName == "lat")
				currentPosition.lat = newValue;
			else if (settingName == "lon")
				currentPosition.lon = newValue;

			updatePosition();
		}

		this.onDispose = function () {
			// for memoryleak
			map = null;
			marker = null;
			poly = null;
		}

		this.getHeight = function () {
			return currentSettings.blocks;
		}

		this.onSettingsChanged(settings);
	};

	freeboard.loadWidgetPlugin({
		type_name: "google_map",
		display_name: "Google Map",
		fill_size: true,
		settings: [
			{
				name: "blocks",
				display_name: "高さ (ブロック数)",
				validate: "required,custom[integer],min[4],max[20]",
				type: "number",
				style: "width:100px",
				default_value: 4,
				description: "1ブロック60ピクセル。20ブロックまで"
			},
			{
				name: "lat",
				display_name: "緯度",
				validate: "optional,maxSize[2000]",
				type: "calculated",
				description: "最大2000文字"
			},
			{
				name: "lon",
				display_name: "経度",
				validate: "optional,maxSize[2000]",
				type: "calculated",
				description: "最大2000文字"
			},
			{
				name: "drawpath",
				display_name: "移動経路の表示",
				type: "boolean",
				default_value: false
			}
		],
		newInstance: function (settings, newInstanceCallback) {
			newInstanceCallback(new googleMapWidget(settings));
		}
	});

	freeboard.addStyle('.html-widget', "white-space:normal;width:100%;height:100%");

	var htmlWidget = function (settings) {
		var self = this;
		var htmlElement = $('<div class="html-widget"></div>');
		var currentSettings = settings;

		this.render = function (element) {
			$(element).append(htmlElement);
		}

		this.onSettingsChanged = function (newSettings) {
			currentSettings = newSettings;
		}

		this.onCalculatedValueChanged = function (settingName, newValue) {
			if (settingName == "html") {
				htmlElement.html(newValue);
			}
		}

		this.onDispose = function () {
		}

		this.getHeight = function () {
			return Number(currentSettings.height);
		}

		this.onSettingsChanged(settings);
	};

	freeboard.loadWidgetPlugin({
		"type_name": "html",
		"display_name": "HTML",
		"fill_size": true,
		"settings": [
			{
				name: "html",
				display_name: "HTML",
				validate: "optional,maxSize[2000]",
				type: "calculated",
				description: "最大2000文字<br>HTML文字列かjavascriptが使用できます。"
			},
			{
				name: "height",
				display_name: "ブロック高さ",
				validate: "required,custom[integer],min[3],max[20]",
				style: "width:100px",
				type: "number",
				default_value: 4,
				description: "1ブロック60ピクセル。20ブロックまで"
			}
		],
		newInstance: function (settings, newInstanceCallback) {
			newInstanceCallback(new htmlWidget(settings));
		}
	});
}());
