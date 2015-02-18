// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ F R E E B O A R D                                                                                                                      │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2015 Daisuke Tanaka (https://github.com/tanaka0323)                                                                        │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                                                                                        │ \\
// └────────────────────────────────────────────────────────────────────┘ \\

(function() {

	var wsDatasource = function(settings, updateCallback) {
		var self = this;

		var currentSettings = settings;
		var ws;
		var dispose = false;
		var CONNECTION_DELAY = 3000;

		function wsOpen() {
			ws = new WebSocket(currentSettings.uri);

			ws.onopen = function(evt) {
				console.info('WebSocket Connected to %s', ws.url);
				retryCount = 0;
			};

			ws.onclose = function(evt) {
				console.info('WebSocket Disconnected from %s', evt.srcElement.url);
				if (dispose === false && currentSettings.reconnect === true) {
					_.delay(function() {
						wsOpen();
					}, CONNECTION_DELAY);
				}
			}

			ws.onmessage = function(evt) {
				try {
					var obj = JSON.parse(evt.data);
					updateCallback(obj);
				} catch (e) {
					console.error('WebSocket Bad parse', evt.data);
				}
			}

			ws.onerror = function(evt) {
				console.error('WebSocket Error', evt);
			}
		}

		function wsClose() {
			if (ws) {
				ws.close();
				ws = null;
			}
		}

		this.updateNow = function() {
		}

		this.onDispose = function() {
			dispose = true;
			wsClose();
		}

		this.onSettingsChanged = function(newSettings) {
			var reconnect = newSettings.reconnect;

			// Set to not reconnect
			currentSettings.reconnect = false;
			wsClose();
			_.delay(function() {
				currentSettings = newSettings;
				currentSettings.reconnect = reconnect;
				wsOpen();
			}, CONNECTION_DELAY);
		}

		wsOpen();
	};

	freeboard.loadDatasourcePlugin({
		type_name: 'websocket',
		display_name: 'WebSocket',
		description: 'WebSocket APIを使用し、JSONデータを受信します。',
		settings: [
			{
				name: 'uri',
				display_name: 'サーバーURI',
				validate: 'required,maxSize[1000]',
				type: 'text',
				description: '最大1000文字 例: ws://server:port/path '
			},
			{
				name: 'reconnect',
				display_name: '自動再接続',
				type: 'boolean',
				default_value: true,
				description: '接続が切れた際自動的に再接続します。'
			}
		],
		newInstance: function(settings, newInstanceCallback, updateCallback) {
			newInstanceCallback(new wsDatasource(settings, updateCallback));
		}
	});
}());
