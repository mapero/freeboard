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
		description: "画像を表示するウィジェットです。Webカメラなどの映像を表示する事に使用します。",
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
}());
