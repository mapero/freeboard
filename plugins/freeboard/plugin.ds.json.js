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

	var jsonDatasource = function (settings, updateCallback) {
		var self = this;
		var PROXY_URL = 'thingproxy.freeboard.io/fetch/';

		var updateTimer = null;
		var currentSettings = settings;
		var errorStage = 0; 	// 0 = try standard request
		// 1 = try JSONP
		// 2 = try thingproxy.freeboard.io
		var lockErrorStage = false;

		function updateRefresh(refreshTime) {
			if (updateTimer) {
				clearInterval(updateTimer);
			}

			updateTimer = setInterval(function () {
				self.updateNow();
			}, refreshTime);
		}

		updateRefresh(currentSettings.refresh * 1000);

		this.updateNow = function () {
			if ((errorStage > 1 && !currentSettings.use_thingproxy) || errorStage > 2) // We've tried everything, let's quit
			{
				return; // TODO: Report an error
			}

			var requestURL = currentSettings.url;

			if (errorStage === 2 && currentSettings.use_thingproxy) {
				requestURL = (location.protocol == 'https:' ? 'https:' : 'http:') + '//' + PROXY_URL + encodeURI(currentSettings.url);
			}

			var body = currentSettings.body;

			// Can the body be converted to JSON?
			if (body) {
				try {
					body = JSON.parse(body);
				}
				catch (e) {
				}
			}

			$.ajax({
				url: requestURL,
				dataType: (errorStage === 1) ? 'JSONP' : 'JSON',
				type: currentSettings.method || 'GET',
				data: body,
				beforeSend: function (xhr) {
					try {
						_.each(currentSettings.headers, function (header) {
							var name = header.name;
							var value = header.value;

							if (!_.isUndefined(name) && !_.isUndefined(value)) {
								xhr.setRequestHeader(name, value);
							}
						});
					}
					catch (e) {
					}
				},
				success: function (data) {
					lockErrorStage = true;
					updateCallback(data);
				},
				error: function (xhr, status, error) {
					if (!lockErrorStage) {
						// TODO: Figure out a way to intercept CORS errors only. The error message for CORS errors seems to be a standard 404.
						errorStage++;
						self.updateNow();
					}
				}
			});
		}

		this.onDispose = function () {
			clearInterval(updateTimer);
			updateTimer = null;
		}

		this.onSettingsChanged = function (newSettings) {
			lockErrorStage = false;
			errorStage = 0;

			currentSettings = newSettings;
			updateRefresh(currentSettings.refresh * 1000);
			self.updateNow();
		}
	};

	freeboard.loadDatasourcePlugin({
		type_name: 'JSON',
		display_name: 'JSON',
		description: '指定のURLからJSONデータを受信します。',
		settings: [
			{
				name: 'url',
				display_name: 'URL',
				validate: 'required,custom[url]',
				type: 'text'
			},
			{
				name: 'use_thingproxy',
				display_name: 'プロキシサーバー試行',
				description: 'まず直接接続し、失敗した場合、JSONP接続を試みます。これも失敗した場合、プロキシサーバーを使用することができます。使用することで多くのAPI接続トラブルを解決できるでしょう。<a href="https://github.com/Freeboard/thingproxy" target="_blank">詳細</a>',
				type: 'boolean',
				default_value: true
			},
			{
				name: 'refresh',
				display_name: '更新頻度',
				validate: 'required,custom[integer],min[1]',
				style: 'width:100px',
				type: 'number',
				suffix: '秒',
				default_value: 5
			},
			{
				name: 'method',
				display_name: 'メソッド',
				type: 'option',
				style: 'width:200px',
				options: [
					{
						name: 'GET',
						value: 'GET'
					},
					{
						name: 'POST',
						value: 'POST'
					},
					{
						name: 'PUT',
						value: 'PUT'
					},
					{
						name: 'DELETE',
						value: 'DELETE'
					}
				]
			},
			{
				name: 'body',
				display_name: 'Body',
				type: 'json',
				validate: 'optional,maxSize[2000]',
				description: 'リクエスト本文。通常はPOSTメソッド時に使用される。最大2000文字'
			},
			{
				name: 'headers',
				display_name: 'Header',
				type: 'array',
				settings: [
					{
						name: 'name',
						display_name: '名前',
						type: 'text',
						validate: 'optional,maxSize[500]',
						description: '最大500文字'
					},
					{
						name: 'value',
						display_name: '値',
						type: 'text',
						validate: 'optional,maxSize[500]',
						description: '最大500文字'
					}
				]
			}
		],
		newInstance: function (settings, newInstanceCallback, updateCallback) {
			newInstanceCallback(new jsonDatasource(settings, updateCallback));
		}
	});
}());
