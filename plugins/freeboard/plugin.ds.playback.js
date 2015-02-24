// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ F R E E B O A R D                                                                                                                      │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2013 Jim Heising (https://github.com/jheising)                                                                             │ \\
// │ Copyright © 2013 Bug Labs, Inc. (http://buglabs.net)                                                                                   │ \\
// │ Copyright © 2015 Daisuke Tanaka (https://github.com/tanaka0323)                                                                        │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                                                                                        │ \\
// └────────────────────────────────────────────────────────────────────┘ \\

(function () {
	'use strict';

	var playbackDatasource = function (settings, updateCallback) {
		var self = this;
		var currentSettings = settings;
		var currentDataset = [];
		var currentIndex = 0;
		var currentTimeout;

		function moveNext() {
			if (currentDataset.length > 0) {
				if (currentIndex < currentDataset.length) {
					updateCallback(currentDataset[currentIndex]);
					currentIndex++;
				}

				if (currentIndex >= currentDataset.length && currentSettings.loop) {
					currentIndex = 0;
				}

				if (currentIndex < currentDataset.length) {
					currentTimeout = setTimeout(moveNext, currentSettings.refresh * 1000);
				}
			}
			else {
				updateCallback({});
			}
		}

		function stopTimeout() {
			currentDataset = [];
			currentIndex = 0;

			if (currentTimeout) {
				clearTimeout(currentTimeout);
				currentTimeout = null;
			}
		}

		this.updateNow = function () {
			stopTimeout();

			$.ajax({
				url: currentSettings.datafile,
				dataType: (currentSettings.is_jsonp) ? 'JSONP' : 'JSON',
				success: function (data) {
					if (_.isArray(data))
						currentDataset = data;
					else
						currentDataset = [];

					currentIndex = 0;

					moveNext();
				},
				error: function (xhr, status, error) {
				}
			});
		};

		this.onDispose = function () {
			stopTimeout();
		};

		this.onSettingsChanged = function (newSettings) {
			currentSettings = newSettings;
			self.updateNow();
		};
	};

	freeboard.loadDatasourcePlugin({
		type_name: 'playback',
		display_name: 'Playback',
		description: '指定された間隔で連続したデータを再生します。オブジェクトの配列を含む有効なJSONファイルを受信します。',
		settings: [
			{
				name: 'datafile',
				display_name: 'データファイルURL',
				validate: 'required,custom[url]',
				type: 'text',
				description: 'JSON配列データへのリンク'
			},
			{
				name: 'is_jsonp',
				display_name: 'JSONP使用',
				type: 'boolean'
			},
			{
				name: 'loop',
				display_name: 'ループ再生',
				type: 'boolean',
				description: '巻戻しとループ再生時終了'
			},
			{
				name: 'refresh',
				display_name: '更新頻度',
				validate: 'required,custom[integer],min[1]',
				style: 'width:100px',
				type: 'number',
				suffix: '秒',
				default_value: 5
			}
		],
		newInstance: function (settings, newInstanceCallback, updateCallback) {
			newInstanceCallback(new playbackDatasource(settings, updateCallback));
		}
	});
}());