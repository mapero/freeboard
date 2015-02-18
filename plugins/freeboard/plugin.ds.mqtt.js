// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ F R E E B O A R D                                                                                                                      │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2015 Daisuke Tanaka (https://github.com/tanaka0323)                                                                        │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                                                                                        │ \\
// └────────────────────────────────────────────────────────────────────┘ \\

(function() {

	var mqttDatasource = function(settings, updateCallback) {

		var self = this;
		var currentSettings = settings;
		var client;
		var dispose = false;
		var CONNECTION_DELAY = 3000;

		function onConnect(frame) {
			console.info('MQTT Connected to %s', currentSettings.hostname);
			client.subscribe(_.isUndefined(currentSettings.topic) ? '' : currentSettings.topic);
		}

		function onConnectionLost(responseObject) {
			console.info('MQTT ConnectionLost %s %s', currentSettings.hostname, responseObject.errorMessage);
			if (dispose === false) {
				if (dispose === false && currentSettings.reconnect === true) {
					_.delay(function() {
						connect();
					}, CONNECTION_DELAY);
				}
			}
		}

		function onConnectFailure(error) {
			client = null;
			console.error('MQTT Failed Connect to %s', currentSettings.hostname);
		}

		function onMessageArrived(message) {
			console.info('MQTT Received %s from %s', message,  currentSettings.hostname);

			var objdata = JSON.parse(message.payloadString);
			if (_.isObject('object')) {
				updateCallback(objdata);
			} else {
				updateCallback(message.payloadString);
			}
		}

		function disconnect() {
			if (client) {
				client.disconnect();
				client = null;
			}
		}

		function connect() {
			try {
				client = new Paho.MQTT.Client(
					_.isUndefined(currentSettings.hostname) ? '' : currentSettings.hostname,
					_.isUndefined(currentSettings.port) ? '' : currentSettings.port,
					_.isUndefined(currentSettings.clientID) ? '' : currentSettings.clientID);
				client.onConnect = onConnect;
				client.onMessageArrived = onMessageArrived;
				client.onConnectionLost = onConnectionLost;
				client.connect({
					userName: _.isUndefined(currentSettings.username) ? '' : currentSettings.username,
					password: _.isUndefined(currentSettings.password) ? '' : currentSettings.password,
					onSuccess: onConnect,
					onFailure: onConnectFailure
				});
			} catch (e) {
				console.error(e);
			}
		}

		this.updateNow = function() {
		};

		this.onDispose = function() {
			dispose = true;
			disconnect();
		};

		this.onSettingsChanged = function(newSettings) {
			var reconnect = newSettings.reconnect;

			// Set to not reconnect
			currentSettings.reconnect = false;
			disconnect();
			_.delay(function() {
				currentSettings = newSettings;
				currentSettings.reconnect = reconnect;
				connect();
			}, CONNECTION_DELAY);
		};

		connect();
	};

	freeboard.loadDatasourcePlugin({
		type_name : 'mqtt',
		display_name : 'MQTT over Websocket',
		description : '<a href="http://mqtt.org/", target="_blank">MQTT</a>プロトコルをWebSocketを介し、MQTTブローカーサーバーからJSONデータを受信します。',
		external_scripts : [ 'plugins/thirdparty/mqttws31.min.js' ],
		settings : [
			{
				name : 'hostname',
				display_name : 'DNSホスト名',
				validate: 'required,maxSize[1000]',
				type: 'text',
				description: '最大1000文字<br>MQTTブローカーサーバーのDNSホスト名を設定して下さい。<br>例: location.hostname'
			},
			{
				name : 'port',
				display_name : 'ポート番号',
				validate: 'required,custom[integer],min[1]',
				type: 'number',
				style: 'width:100px',
				default_value: 8080
			},
			{
				name : 'clientID',
				display_name : 'クライアントID',
				validate: 'required,maxSize[23]',
				type: 'text',
				description: '最大23文字<br>任意のクライアントID文字列',
				default_value: 'SensorCorpus'
			},
			{
				name : 'topic',
				display_name : 'トピック',
				validate: 'required,maxSize[500]',
				type: 'text',
				description: '最大500文字<br>購読するトピック名を設定して下さい。<br>例: my/topic',
				default_value: ''
			},
			{
				name : 'username',
				display_name : '(オプション) ユーザー名',
				validate: 'optional,maxSize[100]',
				type: 'text',
				description: '最大100文字<br>必要ない場合は空白。'
			},
			{
				name : 'password',
				display_name : '(オプション) パスワード',
				validate: 'optional,maxSize[100]',
				type: 'text',
				description: '最大100文字<br>必要ない場合は空白。'
			},
			{
				name: 'reconnect',
				display_name: '自動再接続',
				type: 'boolean',
				default_value: true,
				description: '接続が切れた際自動的に再接続します。'
			}
		],
		newInstance : function(settings, newInstanceCallback, updateCallback) {
			newInstanceCallback(new mqttDatasource(settings, updateCallback));
		}
	});
}());
