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
	'use strict';

	var clockDatasource = function (settings, updateCallback) {
		var self = this;
		var currentSettings = settings;
		var timer;

		function stopTimer() {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
		}

		function updateTimer() {
			stopTimer();
			timer = setInterval(self.updateNow, currentSettings.refresh * 1000);
		}

		this.updateNow = function () {
			var now = moment().tz(currentSettings.timezone);

			var data = {
				numeric_value: now.unix(),
				full_string_value: now.format('YYYY/MM/DD HH:mm:ss'),
				date_string_value: now.format('YYYY/MM/DD'),
				time_string_value: now.format('HH:mm:ss'),
				date_object: now.toDate()
			};

			updateCallback(data);
		};

		this.onDispose = function () {
			stopTimer();
		};

		this.onSettingsChanged = function (newSettings) {
			currentSettings = newSettings;
			if (_.isUndefined(currentSettings.timezone))
				currentSettings.timezone = 'Asia/Tokyo';
			updateTimer();
		};

		updateTimer();
	};

	freeboard.loadDatasourcePlugin({
		type_name: 'clock',
		display_name: '時計',
		description: '指定の間隔で更新され、異なるフォーマットで現在の時刻を返します。画面上にタイマーを表示したり、ウィジェットが一定の間隔でリフレッシュさせるために使用することができます。',
		settings: [
			{
				name: 'timezone',
				display_name: 'タイムゾーン',
				type: 'option',
				default_value: 'Asia/Tokyo',
				options: [
					{
						name: '(UTC-12:00) 国際日付変更線 西側',
						value: 'Etc/GMT+12'
					},
					{
						name: '(UTC-11:00) 協定世界時-11',
						value: 'Etc/GMT+11'
					},
					{
						name: '(UTC-10:00) ハワイ',
						value: 'Pacific/Honolulu'
					},
					{
						name: '(UTC-09:00) アラスカ',
						value: 'America/Anchorage'
					},
					{
						name: '(UTC-08:00) バハカリフォルニア',
						value: 'America/Santa_Isabel'
					},
					{
						name: '(UTC-08:00) 太平洋標準時(米国およびカナダ)',
						value: 'America/Los_Angeles'
					},
					{
						name: '(UTC-07:00) チワワ、ラパス、マサトラン',
						value: 'America/Chihuahua'
					},
					{
						name: '(UTC-07:00) アリゾナ',
						value: 'America/Phoenix'
					},
					{
						name: '(UTC-07:00) 山地標準時(米国およびカナダ)',
						value: 'America/Denver'
					},
					{
						name: '(UTC-06:00) 中央アメリカ',
						value: 'America/Guatemala'
					},
					{
						name: '(UTC-06:00) 中部標準時(米国およびカナダ)',
						value: 'America/Chicago'
					},
					{
						name: '(UTC-06:00) サスカチュワン',
						value: 'America/Regina'
					},
					{
						name: '(UTC-06:00) グアダラハラ、メキシコシティ、モンテレー',
						value: 'America/Mexico_City'
					},
					{
						name: '(UTC-05:00) ボゴタ、リマ、キト',
						value: 'America/Bogota'
					},
					{
						name: '(UTC-05:00) インディアナ東部',
						value: 'America/Indiana/Indianapolis'
					},
					{
						name: '(UTC-05:00) 東部標準時(米国およびカナダ)',
						value: 'America/New_York'
					},
					{
						name: '(UTC-04:30) カラカス',
						value: 'America/Caracas'
					},
					{
						name: '(UTC-04:00) 大西洋標準時(カナダ)',
						value: 'America/Halifax'
					},
					{
						name: '(UTC-04:00) アスンシオン',
						value: 'America/Asuncion'
					},
					{
						name: '(UTC-04:00) ジョージタウン、ラパス、マナウス、サンフアン',
						value: 'America/La_Paz'
					},
					{
						name: '(UTC-04:00) クイアバ',
						value: 'America/Cuiaba'
					},
					{
						name: '(UTC-04:00) サンチアゴ',
						value: 'America/Santiago'
					},
					{
						name: '(UTC-03:30) ニューファンドランド',
						value: 'America/St_Johns'
					},
					{
						name: '(UTC-03:00) ブラジリア',
						value: 'America/Sao_Paulo'
					},
					{
						name: '(UTC-03:00) グリーンランド',
						value: 'America/Godthab'
					},
					{
						name: '(UTC-03:00) カイエンヌ、フォルタレザ',
						value: 'America/Cayenne'
					},
					{
						name: '(UTC-03:00) ブエノスアイレス',
						value: 'America/Argentina/Buenos_Aires'
					},
					{
						name: '(UTC-03:00) モンテビデオ',
						value: 'America/Montevideo'
					},
					{
						name: '(UTC-02:00) 協定世界時-2',
						value: 'Etc/GMT+2'
					},
					{
						name: '(UTC-01:00) カーボベルデ諸島',
						value: 'America/Cape_Verde'
					},
					{
						name: '(UTC-01:00) アゾレス',
						value: 'Atlantic/Azores'
					},
					{
						name: '(UTC+00:00) カサブランカ',
						value: 'America/Casablanca'
					},
					{
						name: '(UTC+00:00) モンロビア、レイキャビク',
						value: 'Atlantic/Reykjavik'
					},
					{
						name: '(UTC+00:00) ダブリン、エジンバラ、リスボン、ロンドン',
						value: 'Europe/London'
					},
					{
						name: '(UTC+00:00) 協定世界時',
						value: 'Etc/GMT'
					},
					{
						name: '(UTC+01:00) アムステルダム、ベルリン、ベルン、ローマ、ストックホルム、ウィーン',
						value: 'Europe/Berlin'
					},
					{
						name: '(UTC+01:00) ブリュッセル、コペンハーゲン、マドリード、パリ',
						value: 'Europe/Paris'
					},
					{
						name: '(UTC+01:00) 西中央アフリカ',
						value: 'Africa/Lagos'
					},
					{
						name: '(UTC+01:00) ベオグラード、ブラチスラバ、ブダペスト、リュブリャナ、プラハ',
						value: 'Europe/Budapest'
					},
					{
						name: '(UTC+01:00) サラエボ、スコピエ、ワルシャワ、ザグレブ',
						value: 'Europe/Warsaw'
					},
					{
						name: '(UTC+01:00) ウィントフック',
						value: 'Africa/Windhoek'
					},
					{
						name: '(UTC+02:00) アテネ、ブカレスト、イスタンブール',
						value: 'Europe/Istanbul'
					},
					{
						name: '(UTC+02:00) ヘルシンキ、キエフ、リガ、ソフィア、タリン、ビリニュス',
						value: 'Europe/Kiev'
					},
					{
						name: '(UTC+02:00) カイロ',
						value: 'Africa/Cairo'
					},
					{
						name: '(UTC+02:00) ダマスカス',
						value: 'Asia/Damascus'
					},
					{
						name: '(UTC+02:00) アンマン',
						value: 'Asia/Amman'
					},
					{
						name: '(UTC+02:00) ハラーレ、プレトリア',
						value: 'Africa/Johannesburg'
					},
					{
						name: '(UTC+02:00) エルサレム',
						value: 'Asia/Jerusalem'
					},
					{
						name: '(UTC+02:00) ベイルート',
						value: 'Asia/Beirut'
					},
					{
						name: '(UTC+03:00) バグダッド',
						value: 'Asia/Baghdad'
					},
					{
						name: '(UTC+03:00) ミンスク',
						value: 'Europe/Minsk'
					},
					{
						name: '(UTC+03:00) クエート、リヤド',
						value: 'Asia/Riyadh'
					},
					{
						name: '(UTC+03:00) ナイロビ',
						value: 'Africa/Nairobi'
					},
					{
						name: '(UTC+03:30) テヘラン',
						value: 'Asia/Tehran'
					},
					{
						name: '(UTC+04:00) モスクワ、サンクトペテルブルグ、ボルゴグラード',
						value: 'Europe/Moscow'
					},
					{
						name: '(UTC+04:00) トビリシ',
						value: 'Asia/Tbilisi'
					},
					{
						name: '(UTC+04:00) エレバン',
						value: 'Asia/Yerevan'
					},
					{
						name: '(UTC+04:00) アブダビ、マスカット',
						value: 'Asia/Dubai'
					},
					{
						name: '(UTC+04:00) バクー',
						value: 'Asia/Baku'
					},
					{
						name: '(UTC+04:00) ポートルイス',
						value: 'Indian/Mauritius'
					},
					{
						name: '(UTC+04:30) カブール',
						value: 'Asia/Kabul'
					},
					{
						name: '(UTC+05:00) タシケント',
						value: 'Asia/Tashkent'
					},
					{
						name: '(UTC+05:00) イスラマバード、カラチ',
						value: 'Asia/Karachi'
					},
					{
						name: '(UTC+05:30) スリジャヤワルダナプラコッテ',
						value: 'Asia/Colombo'
					},
					{
						name: '(UTC+05:30) チェンナイ、コルカタ、ムンバイ、ニューデリー',
						value: 'Indian/Kolkata'
					},
					{
						name: '(UTC+05:45) カトマンズ',
						value: 'Asia/Kathmandu'
					},
					{
						name: '(UTC+06:00) アスタナ',
						value: 'Asia/Almaty'
					},
					{
						name: '(UTC+06:00) ダッカ',
						value: 'Asia/Dhaka'
					},
					{
						name: '(UTC+06:00) エカテリンブルグ',
						value: 'Asia/Yekaterinburg'
					},
					{
						name: '(UTC+06:30) ヤンゴン(ラングーン)',
						value: 'Asia/Rangoon'
					},
					{
						name: '(UTC+07:00) バンコク、ハノイ、ジャカルタ',
						value: 'Asia/Bangkok'
					},
					{
						name: '(UTC+07:00) ノヴォシビルスク',
						value: 'Asia/Novosibirsk'
					},
					{
						name: '(UTC+08:00) クラスノヤルスク',
						value: 'Asia/Krasnoyarsk'
					},
					{
						name: '(UTC+08:00) ウランバートル',
						value: 'Asia/Ulaanbaatar'
					},
					{
						name: '(UTC+08:00) 北京、重慶、香港特別行政区、ウルムチ',
						value: 'Asia/Shanghai'
					},
					{
						name: '(UTC+08:00) パース',
						value: 'Australia/Perth'
					},
					{
						name: '(UTC+08:00) クアラルンプール、シンガポール',
						value: 'Asia/Singapore'
					},
					{
						name: '(UTC+08:00) 台北',
						value: 'Asia/Taipei'
					},
					{
						name: '(UTC+09:00) イルクーツク',
						value: 'Asia/Irkutsk'
					},
					{
						name: '(UTC+09:00) ソウル',
						value: 'Asia/Seoul'
					},
					{
						name: '(UTC+09:00) 大阪、札幌、東京',
						value: 'Asia/Tokyo'
					},
					{
						name: '(UTC+09:30) ダーウィン',
						value: 'Australia/Darwin'
					},
					{
						name: '(UTC+09:30) アデレード',
						value: 'Australia/Adelaide'
					},
					{
						name: '(UTC+10:00) ホバート',
						value: 'Australia/Hobart'
					},
					{
						name: '(UTC+10:00) ヤクーツク',
						value: 'Asia/Yakutsk'
					},
					{
						name: '(UTC+10:00) ブリスベン',
						value: 'Australia/Brisbane'
					},
					{
						name: '(UTC+10:00) グアム、ポートモレスビー',
						value: 'Pacific/Port_Moresby'
					},
					{
						name: '(UTC+10:00) キャンベラ、メルボルン、シドニー',
						value: 'Australia/Sydney'
					},
					{
						name: '(UTC+11:00) ウラジオストク',
						value: 'Asia/Vladivostok'
					},
					{
						name: '(UTC+11:00) ソロモン諸島、ニューカレドニア',
						value: 'Pacific/Guadalcanal'
					},
					{
						name: '(UTC+12:00) 協定世界時+12',
						value: 'Etc/GMT-12'
					},
					{
						name: '(UTC+12:00) フィジー、マーシャル諸島',
						value: 'Pacific/Fiji'
					},
					{
						name: '(UTC+12:00) マガダン',
						value: 'Asia/Magadan'
					},
					{
						name: '(UTC+12:00) オークランド、ウェリントン',
						value: 'Pacific/Auckland'
					},
					{
						name: '(UTC+13:00) ヌクアロファ',
						value: 'Pacific/Tongatapu'
					},
					{
						name: '(UTC+13:00) サモア',
						value: 'Pacific/Apia'
					}
				]
			},
			{
				name: 'refresh',
				display_name: '更新頻度',
				validate: 'required,custom[integer],min[1]',
				style: 'width:100px',
				type: 'number',
				suffix: '秒',
				default_value: 1
			}
		],
		newInstance: function (settings, newInstanceCallback, updateCallback) {
			newInstanceCallback(new clockDatasource(settings, updateCallback));
		}
	});
}());

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
	'use strict';

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
		};

		this.onDispose = function () {
			clearInterval(updateTimer);
			updateTimer = null;
		};

		this.onSettingsChanged = function (newSettings) {
			lockErrorStage = false;
			errorStage = 0;

			currentSettings = newSettings;
			updateRefresh(currentSettings.refresh * 1000);
			self.updateNow();
		};
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

// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ F R E E B O A R D                                                                                                                      │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2015 Daisuke Tanaka (https://github.com/tanaka0323)                                                                        │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                                                                                        │ \\
// └────────────────────────────────────────────────────────────────────┘ \\

(function() {
	'use strict';

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

// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ F R E E B O A R D                                                                                                                      │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2014 Hugo Sequeira (https://github.com/hugocore)                                                                           │ \\
// │ Copyright © 2015 Daisuke Tanaka (https://github.com/tanaka0323)                                                                        │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                                                                                        │ \\
// └────────────────────────────────────────────────────────────────────┘ \\

(function() {
	'use strict';

	var nodeJSDatasource = function(settings, updateCallback) {

		var self = this,
			currentSettings = settings,
			url,
			socket,
			newMessageCallback;

		function onNewMessageHandler(message) {
			var objdata = JSON.parse(message);
			if (_.isObject('object'))
				updateCallback(objdata);
			else
				updateCallback(message);
		}

		function joinRoom(roomName, roomEvent) {
			// Sends request to join the new room
			// (handle event on server-side)
			self.socket.emit(roomEvent, roomName);
			console.info('Joining room "%s" with event "%s"', roomName, roomEvent);
		}

		function discardSocket() {
			// Disconnect datasource websocket
			if (self.socket)
				self.socket.disconnect();
		}

		function connectToServer(url, rooms) {
			// Establish connection with server
			self.url = url;
			self.socket = io.connect(self.url,{'forceNew':true});

			// Join the rooms
			self.socket.on('connect', function() {
				console.info('Connecting to Node.js at: %s', self.url);
			});

			// Join the rooms
			_.each(rooms, function(roomConfig) {
				var roomName = roomConfig.roomName;
				var roomEvent = roomConfig.roomEvent;

				if (!_.isUndefined(roomName) && !_.isUndefined(roomEvent)) {
					joinRoom(roomName, roomEvent);
				}

			});

			self.socket.on('connect_error', function(object) {
				console.error('It was not possible to connect to Node.js at: %s', self.url);
			});

			self.socket.on('reconnect_error', function(object) {
				console.error('Still was not possible to re-connect to Node.js at: %s', self.url);
			});

			self.socket.on('reconnect_failed', function(object) {
				console.error('Re-connection to Node.js failed at: %s', self.url);
				discardSocket();
			});

		}


		function initializeDataSource() {
			// Reset connection to server
			discardSocket();
			connectToServer(currentSettings.url, currentSettings.rooms);

			// Subscribe to the events
			var newEventName = currentSettings.eventName;
			self.newMessageCallback = onNewMessageHandler;
			_.each(currentSettings.events, function(eventConfig) {
				var event = eventConfig.eventName;
				console.info('Subscribing to event: %s', event);
				self.socket.on(event, function(message) {
					self.newMessageCallback(message);
				});
			});
		}

		this.updateNow = function() {
			// Just seat back, relax and wait for incoming events
			return;
		};

		this.onDispose = function() {
			// Stop responding to messages
			self.newMessageCallback = function(message) {
				return;
			};
			discardSocket();
		};

		this.onSettingsChanged = function(newSettings) {
			currentSettings = newSettings;
			initializeDataSource();
		};

		initializeDataSource();
	};

	freeboard.loadDatasourcePlugin({
		type_name : 'node_js',
		display_name : 'Node.js (Socket.io)',
		description : '<a href="http://socket.io/", target="_blank">Socket.io</a>を使用したnode.jsサーバーからJSONデータを受信します。',
		external_scripts : [ 'https://cdn.socket.io/socket.io-1.2.1.js' ],
		settings : [
			{
				name: 'url',
				display_name: 'サーバーURL',
				validate: 'required,maxSize[1000]',
				type: 'text',
				description: '最大1000文字 (オプション) カスタム名前空間を使用する場合、URLの最後に名前空間を追加して下さい。<br>例: http://localhost/chat'
			},
			{
				name : 'events',
				display_name : 'イベント',
				description : 'データソースへ追加するイベント名を指定して下さい。',
				type : 'array',
				settings : [ {
					name : 'eventName',
					display_name : 'イベント名',
					validate: 'optional,maxSize[100]',
					type: 'text'
				} ]
			},
			{
				name : 'rooms',
				display_name : '(オプション) ルーム',
				description : 'ルームを使用する場合, 追加したいルーム名を指定して下さい。その他の場合は空白のままにしておいて下さい。',
				type : 'array',
				settings : [ {
					name : 'roomName',
					display_name : 'ルーム名',
					validate: 'optional,maxSize[100]',
					type: 'text'
				}, {
					name : 'roomEvent',
					display_name : 'ルームに参加するイベント名',
					validate: 'optional,maxSize[100]',
					type: 'text'
				} ]
			}
		],
		newInstance : function(settings, newInstanceCallback, updateCallback) {
			newInstanceCallback(new nodeJSDatasource(settings, updateCallback));
		}
	});
}());

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

	var openWeatherMapDatasource = function (settings, updateCallback) {
		var self = this;
		var updateTimer = null;
		var currentSettings = settings;

		function updateRefresh(refreshTime) {
			if (updateTimer) {
				clearInterval(updateTimer);
			}

			updateTimer = setInterval(function () {
				self.updateNow();
			}, refreshTime);
		}

		function toTitleCase(str) {
			return str.replace(/\w\S*/g, function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		}

		updateRefresh(currentSettings.refresh * 1000);

		this.updateNow = function () {
			$.ajax({
				url: "http://api.openweathermap.org/data/2.5/weather?q=" + encodeURIComponent(currentSettings.location) + "&units=" + currentSettings.units,
				dataType: "JSONP",
			})
			.done(function (data) {
				// Rejigger our data into something easier to understand
				var easy = {
					place_name: data.name,
					latitude: data.coord.lat,
					longitude: data.coord.lon,
					sunset: moment.unix(data.sys.sunset * 1000).format('HH:mm:ss'), // Bug value the opposite
					sunrise: moment.unix(data.sys.sunrise * 1000).format('HH:mm:ss'),
					conditions: toTitleCase(data.weather[0].description),
					current_temp: data.main.temp,
					high_temp: data.main.temp_max,
					low_temp: data.main.temp_min,
					pressure: data.main.pressure,
					humidity: data.main.humidity,
					wind_speed: data.wind.speed,
					wind_direction: data.wind.deg
				};
				updateCallback(_.merge(data, easy));
			})
			.fail(function (xhr, status) {
				console.error('Open Weather Map API error: ' + status);
			});
		};

		this.onDispose = function () {
			clearInterval(updateTimer);
			updateTimer = null;
		};

		this.onSettingsChanged = function (newSettings) {
			currentSettings = newSettings;
			self.updateNow();
			updateRefresh(currentSettings.refresh * 1000);
		};
	};

	freeboard.loadDatasourcePlugin({
		type_name: "openweathermap",
		display_name: "Open Weather Map API",
		description: "天候や予測履歴を含む各種気象データを受信します。",
		settings: [
			{
				name: "location",
				display_name: "場所",
				validate: "required,maxSize[200]",
				type: "text",
				description: "最大200文字<br>例: London, UK"
			},
			{
				name: "units",
				display_name: "単位",
				style: "width:200px",
				type: "option",
				default_value: "metric",
				options: [
					{
						name: "メトリック",
						value: "metric"
					},
					{
						name: "インペリアル",
						value: "imperial"
					}
				]
			},
			{
				name: "refresh",
				display_name: "更新頻度",
				validate: "required,custom[integer],min[5]",
				style: "width:100px",
				type: "number",
				suffix: "秒",
				default_value: 5
			}
		],
		newInstance: function (settings, newInstanceCallback, updateCallback) {
			newInstanceCallback(new openWeatherMapDatasource(settings, updateCallback));
		}
	});
}());
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
// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ F R E E B O A R D                                                                                                                      │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2015 Daisuke Tanaka (https://github.com/tanaka0323)                                                                        │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                                                                                        │ \\
// └────────────────────────────────────────────────────────────────────┘ \\

(function() {
	'use strict';

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
			};

			ws.onclose = function(evt) {
				console.info('WebSocket Disconnected from %s', evt.srcElement.url);
				if (dispose === false && currentSettings.reconnect === true) {
					_.delay(function() {
						wsOpen();
					}, CONNECTION_DELAY);
				}
			};

			ws.onmessage = function(evt) {
				try {
					var obj = JSON.parse(evt.data);
					updateCallback(obj);
				} catch (e) {
					console.error('WebSocket Bad parse', evt.data);
				}
			};

			ws.onerror = function(evt) {
				console.error('WebSocket Error', evt);
			};
		}

		function wsClose() {
			if (ws) {
				ws.close();
				ws = null;
			}
		}

		this.updateNow = function() {
		};

		this.onDispose = function() {
			dispose = true;
			wsClose();
		};

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
		};

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

	var yahooWeatherDatasource = function (settings, updateCallback) {
		var self = this;
		var updateTimer = null;
		var currentSettings = settings;

		// condition code
		var conditionMap = [
			'竜巻',                     // 0   tornado
			'台風',                     // 1   tropical storm
			'ハリケーン',               // 2   hurricane
			'激しい雷雨',               // 3   severe thunderstorms
			'雷雨',                     // 4   thunderstorms
			'雪混じりの雨',             // 5   mixed rain and snow
			'みぞれ混じりの雨',         // 6   mixed rain and sleet
			'みぞれ混じりの雪',         // 7   mixed snow and sleet
			'着氷性の霧雨',             // 8   freezing drizzle
			'霧雨',                     // 9   drizzle
			'着氷性の雨',               // 10  freezing rain
			'にわか雨',                 // 11  showers
			'にわか雨',                 // 12  showers
			'雪の突風',                 // 13  snow flurries
			'時々雪',                   // 14  light snow showers
			'吹雪',                     // 15  blowing snow
			'雪',                       // 16  snow
			'雹',                       // 17  hail
			'みぞれ',                   // 18  sleet
			'ほこり',                   // 19  dust
			'霧',                       // 20  foggy
			'靄',                       // 21  haze
			'埃っぽい',                 // 22  smoky
			'荒れ模様',                 // 23  blustery
			'強風',                     // 24  windy
			'寒い',                     // 25  cold
			'曇り',                     // 26  cloudy
			'おおむね曇り(夜)',         // 27  mostly cloudy (night)
			'おおむね曇り(昼)',         // 28  mostly cloudy (day)
			'ところにより曇り(夜)',     // 29  partly cloudy (night)
			'ところにより曇り(昼)',     // 30  partly cloudy (day)
			'快晴(夜)',                 // 31  clear (night)
			'陽気な晴れ',               // 32  sunny
			'晴れ(夜)',                 // 33  fair (night)
			'晴れ(昼)',                 // 34  fair (day)
			'雨と雹',                   // 35  mixed rain and hail
			'暑い',                     // 36  hot
			'局地的に雷雨',             // 37  isolated thunderstorms
			'ところにより雷雨',         // 38  scattered thunderstorms
			'ところにより雷雨',         // 39  scattered thunderstorms
			'ところによりにわか雨',     // 40  scattered showers
			'大雪',                     // 41  heavy snow
			'吹雪',                     // 42  scattered snow showers
			'大雪',                     // 43  heavy snow
			'ところにより曇り',         // 44  partly cloudy
			'雷雨',                     // 45  thundershowers
			'吹雪',                     // 46  snow showers
			'ところにより雷雨'          // 47  isolated thundershowers
		];

		function updateRefresh(refreshTime) {
			if (updateTimer) {
				clearInterval(updateTimer);
			}

			updateTimer = setInterval(function () {
				self.updateNow();
			}, refreshTime);
		}

		this.updateNow = function () {
			var units = (currentSettings.units === 'metric') ? 'c' : 'f';
			var query = "select * from weather.bylocation where location='" + currentSettings.location + "' and unit='" + units + "'";
			var uri = 'https://query.yahooapis.com/v1/public/yql?q=' +
					encodeURIComponent(query) +
					'&format=json&env=' +
					encodeURIComponent('store://datatables.org/alltableswithkeys');
			$.ajax({
				url: uri,
				dataType: 'JSONP'
			})
			.done(function (data) {
				if (!_.isObject(data))
					return;
				if (_.has(data, 'error')) {
					console.error('Yahoo Weather API error: ' + data.error.description);
					return;
				}
				if (!_.has(data, 'query') && _.has(data, 'query.results'))
					return;
				data = data.query.results.weather.rss.channel;
				var easy = {
					place_name: _.isUndefined(data.location.city) ? '' : data.location.city,
					latitude: Number(data.item.lat),
					longitude: Number(data.item.long),
					sunrise: data.astronomy.sunrise,
					sunset: data.astronomy.sunset,
					conditions: conditionMap[data.item.condition.code],
					current_temp: Number(data.item.condition.temp),
					high_temp: Number(data.item.forecast[0].high),
					low_temp: Number(data.item.forecast[0].low),
					pressure: Number(data.atmosphere.pressure),
					humidity: Number(data.atmosphere.humidity),
					wind_speed: Number(data.wind.speed),
					wind_direction: Number(data.wind.direction)
				};
				updateCallback(_.merge(data, easy));
			})
			.fail(function (xhr, status) {
				console.error('Yahoo Weather API error: ' + status);
			});
		};

		this.onDispose = function () {
			clearInterval(updateTimer);
			updateTimer = null;
		};

		this.onSettingsChanged = function (newSettings) {
			currentSettings = newSettings;
			self.updateNow();
			updateRefresh(currentSettings.refresh * 1000);
		};

		updateRefresh(currentSettings.refresh * 1000);
	};

	freeboard.loadDatasourcePlugin({
		type_name: 'yahooweather',
		display_name: 'Yahoo Weather API',
		description: '<a href="https://developer.yahoo.com/weather/documentation.html" target="_blank">Yahoo Weather API</a>を使用し、天候や予測含む各種気象データを受信します。',
		settings: [
			{
				name: 'location',
				display_name: 'ロケーション郵便番号',
				validate: 'required,maxSize[100]',
				type: 'text',
				description: '最大100文字 半角英字の地名でも可'
			},
			{
				name: 'units',
				display_name: '単位',
				style: 'width:200px',
				type: 'option',
				default_value: 'metric',
				options: [
					{
						name: 'メトリック',
						value: 'metric'
					},
					{
						name: 'インペリアル',
						value: 'imperial'
					}
				]
			},
			{
				name: 'refresh',
				display_name: '更新頻度',
				validate: 'required,custom[integer],min[30]',
				style: 'width:100px',
				type: 'number',
				suffix: '秒',
				default_value: 30
			}
		],
		newInstance: function (settings, newInstanceCallback, updateCallback) {
			newInstanceCallback(new yahooWeatherDatasource(settings, updateCallback));
		}
	});
}());
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
			if (!_.isNull(gauge))
				gauge.resize();
		}

		function createGauge() {
			if (!_.isNull(gauge)) {
				gauge.destroy();
				gauge = null;
			}

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
					comma: currentSettings.comma,
					metricPrefix: currentSettings.metric_prefix,
					metricPrefixDecimal: currentSettings.decimal,
					metricPrefixMinMax: currentSettings.metric_prefix,
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
				currentSettings.comma != newSettings.comma ||
				currentSettings.metric_prefix != newSettings.metric_prefix ||
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
			if (!_.isNull(gauge)) {
				gauge.destroy();
				gauge = null;
			}
		};

		this.onSizeChanged = function () {
			if (!_.isNull(gauge))
				gauge.resize();
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
				name: 'comma',
				display_name: 'カンマ表示',
				type: 'boolean',
				default_value: false,
			},
			{
				name: 'metric_prefix',
				display_name: '国際単位系表示',
				type: 'boolean',
				default_value: false,
				description: '1000なら1Kのように値を短縮します。'
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
	'use strict';

	freeboard.addStyle('.gm-style-cc a', 'text-shadow:none;');

	var googleMapWidget = function (settings) {
		var self = this;
		var BLOCK_HEIGHT = 60;

		var currentSettings = settings;
		var map = null,
			marker = null,
			poly = null;
		var mapElement = $('<div></div>');
		var currentPosition = {};

		function updatePosition() {
			if (!_.isNull(map) && !_.isNull(marker) && currentPosition.lat && currentPosition.lon) {
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
			var height = BLOCK_HEIGHT * blocks;
			mapElement.css({
				'height': height + 'px',
				'width': '100%'
			});
			if (!_.isNull(map)) {
				google.maps.event.trigger(mapElement[0], 'resize');
				updatePosition();
			}
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

				updatePosition();
			}

			if (window.google && window.google.maps) {
				initializeMap();
			} else {
				window.gmap_initialize = initializeMap;
				head.js('https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=gmap_initialize');
			}
		}

		this.render = function (element) {
			$(element).append(mapElement);
			setBlocks(currentSettings.blocks);
			createWidget();
		};

		this.onSettingsChanged = function (newSettings) {
			if (_.isNull(map)) {
				currentSettings = newSettings;
				return;
			}

			var updateCalculate = false;
			if (currentSettings.blocks != newSettings.blocks)
				setBlocks(newSettings.blocks);
			if (!newSettings.drawpath)
				poly.getPath().clear();

			if (currentSettings.lat != newSettings.lat || currentSettings.lon != newSettings.lon)
				updateCalculate = true;
			currentSettings = newSettings;
			return updateCalculate;
		};

		this.onCalculatedValueChanged = function (settingName, newValue) {
			if (settingName === 'lat')
				currentPosition.lat = newValue;
			else if (settingName === 'lon')
				currentPosition.lon = newValue;

			updatePosition();
		};

		this.onDispose = function () {
			// for memoryleak
			map = marker = poly = null;
		};

		this.onSizeChanged = function () {
			if (!_.isNull(map)) {
				google.maps.event.trigger(mapElement[0], 'resize');
				updatePosition();
			}
		};

		this.getHeight = function () {
			return currentSettings.blocks;
		};

		this.onSettingsChanged(settings);
	};

	freeboard.loadWidgetPlugin({
		type_name: 'google_map',
		display_name: 'Google Map',
		description: 'GoogleMapを表示するウィジェットです。緯度経度に値を設定するとその周辺の地図が表示されます。',
		fill_size: true,
		settings: [
			{
				name: 'blocks',
				display_name: '高さ (ブロック数)',
				validate: 'required,custom[integer],min[4],max[20]',
				type: 'number',
				style: 'width:100px',
				default_value: 4,
				description: '1ブロック60ピクセル。20ブロックまで'
			},
			{
				name: 'lat',
				display_name: '緯度',
				validate: 'optional,maxSize[2000]',
				type: 'calculated',
				description: '最大2000文字'
			},
			{
				name: 'lon',
				display_name: '経度',
				validate: 'optional,maxSize[2000]',
				type: 'calculated',
				description: '最大2000文字'
			},
			{
				name: 'drawpath',
				display_name: '移動経路の表示',
				type: 'boolean',
				default_value: false
			}
		],
		newInstance: function (settings, newInstanceCallback) {
			newInstanceCallback(new googleMapWidget(settings));
		}
	});
}());

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
	'use strict';

	freeboard.addStyle('.indicator-light', 'border-radius:50%;width:22px;height:22px;border:2px solid #3d3d3d;margin-top:5px;float:left;background-color:#222;margin-right:10px;');
	freeboard.addStyle('.indicator-light.on', 'background-color:#FFC773;box-shadow: 0px 0px 15px #FF9900;border-color:#FDF1DF;');
	freeboard.addStyle('.indicator-text', 'margin-top:10px;');

	var indicatorWidget = function(settings) {
		var self = this;
		var titleElement = $('<h2 class="section-title"></h2>');
		var stateElement = $('<div class="indicator-text"></div>');
		var indicatorElement = $('<div class="indicator-light"></div>');
		var currentSettings = settings;
		var isOn = false;

		function updateState() {
			indicatorElement.toggleClass('on', isOn);

			if (isOn) {
				stateElement.text((_.isUndefined(currentSettings.on_text) ? '' : currentSettings.on_text));
			}
			else {
				stateElement.text((_.isUndefined(currentSettings.off_text) ? '' : currentSettings.off_text));
			}
		}

		this.render = function (element) {
			$(element).append(titleElement).append(indicatorElement).append(stateElement);
		};

		this.onSettingsChanged = function (newSettings) {
			currentSettings = newSettings;
			titleElement.html((_.isUndefined(newSettings.title) ? '' : newSettings.title));
			updateState();
			return true;
		};

		this.onCalculatedValueChanged = function (settingName, newValue) {
			if (settingName === 'value') {
				isOn = Boolean(newValue);
			}

			updateState();
		};

		this.onDispose = function () {
		};

		this.getHeight = function () {
			return 1;
		};

		this.onSettingsChanged(settings);
	};

	freeboard.loadWidgetPlugin({
		type_name: 'indicator',
		display_name: '点灯ライト',
		description: '指定した値の条件でライトが点灯するウィジェットです。ONにするには 1 を、OFFにするには 0 を値に設定して下さい。',
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
				name: 'on_text',
				display_name: 'ON時テキスト',
				validate: 'optional,maxSize[500]',
				type: 'calculated',
				description: '最大500文字'
			},
			{
				name: 'off_text',
				display_name: 'OFF時テキスト',
				validate: 'optional,maxSize[500]',
				type: 'calculated',
				description: '最大500文字'
			}
		],
		newInstance: function (settings, newInstanceCallback) {
			newInstanceCallback(new indicatorWidget(settings));
		}
	});
}());

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
	'use strict';

	freeboard.addStyle('.picture-widget', 'background-size:contain; background-position:center; background-repeat: no-repeat;');

	var pictureWidget = function(settings) {
		var self = this;
		var BLOCK_HEIGHT = 60;
		var TITLE_MARGIN = 7;

		var widgetElement = $('<div class="picture-widget"></div>');
		var titleElement = $('<h2 class="section-title"></h2>');
		var currentSettings;
		var timer;
		var imageURL;

		function setBlocks(blocks) {
			if (_.isUndefined(blocks))
				return;
			var height = BLOCK_HEIGHT * blocks - titleElement.outerHeight() - TITLE_MARGIN;
			widgetElement.css({
				'height': height + 'px',
				'width': '100%'
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
				var cacheBreakerURL = imageURL + (imageURL.indexOf('?') === -1 ? '?' : '&') + Date.now();

				$(widgetElement).css({
					'background-image' :  'url(' + cacheBreakerURL + ')'
				});
			}
		}

		this.render = function(element) {
			$(element).append(titleElement).append(widgetElement);
			titleElement.html((_.isUndefined(currentSettings.title) ? '' : currentSettings.title));
			setBlocks(currentSettings.blocks);
		};

		this.onSettingsChanged = function(newSettings) {
			if (titleElement.outerHeight() === 0) {
				currentSettings = newSettings;
				return;
			}
			stopTimer();

			if (newSettings.refresh && newSettings.refresh > 0)
				timer = setInterval(updateImage, Number(newSettings.refresh) * 1000);

			titleElement.html((_.isUndefined(newSettings.title) ? '' : newSettings.title));

			setBlocks(newSettings.blocks);
			var updateCalculate = false;
			if (currentSettings.src != newSettings.src)
				updateCalculate = true;
			currentSettings = newSettings;
			return updateCalculate;
		};

		this.onCalculatedValueChanged = function(settingName, newValue) {
			if (settingName === 'src')
				imageURL = newValue;

			updateImage();
		};

		this.onDispose = function() {
			stopTimer();
		};

		this.getHeight = function() {
			return currentSettings.blocks;
		};

		this.onSettingsChanged(settings);
	};

	freeboard.loadWidgetPlugin({
		type_name: 'picture',
		display_name: '画像',
		description: '画像を表示するウィジェットです。Webカメラなどの映像を表示する事に使用します。',
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
				validate: 'required,custom[integer],min[4],max[20]',
				type: 'number',
				style: 'width:100px',
				default_value: 4,
				description: '1ブロック60ピクセル。20ブロックまで'
			},
			{
				name: 'src',
				display_name: '画像URL',
				validate: 'optional,maxSize[2000]',
				type: 'calculated',
				description: '最大2000文字'
			},
			{
				type: 'number',
				display_name: '更新頻度',
				validate: 'optional,custom[integer],min[1]',
				style: 'width:100px',
				name: 'number',
				suffix: '秒',
				description:'更新する必要がない場合は空白のまま'
			}
		],
		newInstance: function (settings, newInstanceCallback) {
			newInstanceCallback(new pictureWidget(settings));
		}
	});
}());

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
	'use strict';

	freeboard.addStyle('.pointer-widget', 'width:100%;');

	var pointerWidget = function (settings) {
		var self = this;

		var CIRCLE_WIDTH = 3;
		var BLOCK_HEIGHT = 60;
		var TITLE_MARGIN = 7;

		var currentID = _.uniqueId('pointer_');
		var titleElement = $('<h2 class="section-title"></h2>');
		var widgetElement = $('<div class="pointer-widget" id="' + currentID + '"></div>');
		var currentSettings = settings;
		var fontcolor = '#d3d4d4';
		var widgetSize = {
			height: 0,
			width: 0
		};

		// d3 variables
		var svg = null, center = null, pointer = null, textValue = null, textUnits = null, circle = null;

		function setBlocks(blocks) {
			if (_.isUndefined(blocks))
				return;
			var height = BLOCK_HEIGHT * blocks - titleElement.outerHeight() - TITLE_MARGIN;
			widgetElement.css({
				height: height + 'px',
				width: '100%'
			});
			resize();
		}

		function getWidgetSize(rc) {
			var h, w, aspect;
			if (rc.width > rc.height) {
				h = rc.height;
				w = h * 1.25;
				if (w > rc.width) {
					aspect = w / rc.width;
					w = w / aspect;
					h = h / aspect;
				}
			} else if (rc.width < rc.height) {
				w = rc.width;
				h = w / 1.25;
				if (h > rc.height) {
					aspect = w / rc.height;
					h = h / aspect;
					width = h / aspect;
				}
			} else {
				w = rc.width;
				h = w * 0.75;
			}
			return { height: h, width: w };
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

		function getCenteringTransform(rc) {
			return 'translate(' + (rc.width/2) + ',' + (rc.height/2) + ')';
		}

		function getRadius(rc) {
			return Math.min(rc.height, rc.width) / 2 - CIRCLE_WIDTH * 2;
		}

		function calcValueFontSize(r) {
			return (5*r/102.5).toFixed(2);
		}

		function calcUnitsFontSize(r) {
			return (1.1*r/102.5).toFixed(2);
		}

		function getPointerPath(r) {
			return polygonPath([0, - r + CIRCLE_WIDTH, 15, -(r-20), -15, -(r-20)]);
		}

		function resize() {
			if (_.isNull(svg))
				return;

			var rc = widgetElement[0].getBoundingClientRect();
			var newSize = getWidgetSize(rc);

			svg.attr('height', rc.height);
			svg.attr('width', rc.width);

			var x = newSize.width / widgetSize.width;
			var y = newSize.height / widgetSize.height;

			center.attr('transform', getCenteringTransform(rc)+',scale('+x+', '+y+')');
		}

		function createWidget() {

			var rc = widgetElement[0].getBoundingClientRect();

			svg = d3.select('#' + currentID)
				.append('svg')
				.attr('width', rc.width)
				.attr('height', rc.height);

			center = svg.append('g')
				.attr('transform', getCenteringTransform(rc));

			widgetSize = getWidgetSize(rc);
			var r = getRadius(widgetSize);
			circle = center.append('circle')
				.attr('r', r)
				.style('fill', 'rgba(0, 0, 0, 0)')
				.style('stroke-width', CIRCLE_WIDTH)
				.style('stroke', currentSettings.circle_color);

			textValue = center.append('text')
				.text('0')
				.style('fill', fontcolor)
				.style('text-anchor', 'middle')
				.attr('dy', '.3em')
				.attr('font-size', calcValueFontSize(r) + 'em')
				.attr('class', 'ultralight-text');

			textUnits = center.append('text')
				.text(currentSettings.units)
				.style('fill', fontcolor)
				.style('text-anchor', 'middle')
				.attr('dy', '2.8em')
				.attr('font-size', calcUnitsFontSize(r) + 'em')
				.attr('class', 'ultralight-text');

			pointer = center.append('path')
				.style('fill', currentSettings.pointer_color)
				.attr('d', getPointerPath(r));
		}

		this.render = function (element) {
			$(element).append(titleElement).append(widgetElement);
			titleElement.html((_.isUndefined(currentSettings.title) ? '' : currentSettings.title));
			setBlocks(currentSettings.blocks);
			createWidget();
		};

		this.onSettingsChanged = function (newSettings) {
			if (_.isNull(svg)) {
				currentSettings = newSettings;
				return;
			}

			titleElement.html((_.isUndefined(newSettings.title) ? '' : newSettings.title));
			circle.style('stroke', newSettings.circle_color);
			pointer.style('fill', newSettings.pointer_color);
			textUnits.text((_.isUndefined(newSettings.units) ? '' : newSettings.units));
			setBlocks(newSettings.blocks);

			var updateCalculate = false;
			if (currentSettings.direction != newSettings.direction ||
				currentSettings.value_text != newSettings.value_text)
				updateCalculate = true;
			currentSettings = newSettings;
			return updateCalculate;
		};

		this.onCalculatedValueChanged = function (settingName, newValue) {
			if (_.isNull(svg))
				return;
			if (settingName === 'direction') {
				pointer.transition()
					.duration(250)
					.ease('bounce-out')
					.attrTween('transform', function(d, i, a) {
						return d3.interpolateString(a, 'rotate(' + parseInt(newValue) + ', 0, 0)');
					});
			} else if (settingName === 'value_text') {
				if (_.isUndefined(newValue))
					return;
				textValue.transition()
					.duration(500)
					.ease('circle-out')
					.tween('text', function() {
						var i = d3.interpolate(this.textContent, Number(newValue));
						return function(t) {
							this.textContent = i(t).toFixed(1);
						};
					});
			}
		};

		this.onDispose = function () {
			svg = circle = center = pointer = textValue = textUnits = null;
		};

		this.onSizeChanged = function () {
			resize();
		};

		this.getHeight = function () {
			return currentSettings.blocks;
		};

		this.onSettingsChanged(settings);
	};

	freeboard.loadWidgetPlugin({
		type_name: 'pointer',
		display_name: 'ポインタ',
		description: '方角と値を表示するウィジェットです。',
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
				name: 'direction',
				display_name: '方向',
				validate: 'optional,maxSize[2000]',
				type: 'calculated',
				description: '最大2000文字<br>角度を入力して下さい。'
			},
			{
				name: 'value_text',
				display_name: '値テキスト',
				validate: 'optional,maxSize[2000]',
				type: 'calculated',
				description: '最大2000文字'
			},
			{
				name: 'units',
				display_name: '単位',
				validate: 'optional,maxSize[20]',
				style: 'width:150px',
				type: 'text',
				description: '最大20文字'
			},
			{
				name: 'circle_color',
				display_name: 'サークル色',
				validate: 'required,custom[hexcolor]',
				type: 'color',
				default_value: '#ff9900',
				description: 'デフォルト色: #ff9900'
			},
			{
				name: 'pointer_color',
				display_name: 'ポインタ色',
				validate: 'required,custom[hexcolor]',
				type: 'color',
				default_value: '#fff',
				description: 'デフォルト色: #fff'
			}
		],
		newInstance: function (settings, newInstanceCallback) {
			newInstanceCallback(new pointerWidget(settings));
		}
	});
}());

// ┌─────────────────────────────────────────┐ \\
// │ F R E E B O A R D                                                                │ \\
// ├─────────────────────────────────────────┤ \\
// │ Copyright © 2013 Jim Heising (https://github.com/jheising)                       │ \\
// │ Copyright © 2013 Bug Labs, Inc. (http://buglabs.net)                             │ \\
// │ Copyright © 2015 Daisuke Tanaka (https://github.com/tanaka0323)                  │ \\
// ├─────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                                  │ \\
// └─────────────────────────────────────────┘ \\

(function() {
	'use strict';

	freeboard.addStyle('.tw-tooltip',
			'position: absolute;' +
			'font-size: 0.7em;' +
			'color: white;' +
			'text-align: center;' +
			'height: 20px;' +
			'padding: 2px 8px 2px 8px;' +
			'background: black;' +
			'opacity: 0.8;' +
			'border: solid 1px #fff;' +
			'pointer-events: none;' +
			'-webkit-box-shadow: 0 0 5px #000;' +
			'-moz-box-shadow: 0 0 5px #000;' +
			'box-shadow: 0 0 5px #000;'
			);

	var textWidget = function (settings) {
		var self = this;
		var BLOCK_HEIGHT = 60;
		var PADDING = 10;

		var currentSettings = settings;

		var currentID = _.uniqueId('textwidget_');
		var titleElement = $('<h2 class="section-title"></h2>');
		var widgetElement = $('<div class="text-widget" id="' + currentID + '"></div>');

		var option = {
			fontColor: '#d3d4d4',
			decimal: 0,
			comma: 0,
			metricPrefix: false,
			transition: {
				enable: true,
				type: 'circle-out',
				duration: 500
			},
			chart: {
				type: 'line',
				margin: { left: 3, right: 3, bottom: 5 },
				transition: {
					type: 'circle-out',
					duration: 500
				},
				lineWidth: 2,
				spotsize: 3.3,
				color: '#ff9900',
				spotcolor: {
					def: '#FF0000',
					max: '#0496ff',
					min: '#0496ff'
				}
			}
		};

		var d3var = {
			svg: null,
			gText: null,
			gChart: null,
			textValue: null,
			textUnits: null,
			chart: {
				minValIndex: -1,
				maxValIndex: -1,
				highlightIndex: -1,
				height: 0,
				width: 0,
				xTickcount: 100,
				xScale: null,
				xRevScale: null,
				yScale: null,
				line: null,
				area: null,
				data: null,
				gTooltip: null,
			}
		};

		function getFontSize() {
			return (currentSettings.size === 'big') ? '4.3em' : '1.95em';
		}

		function getUnitDy() {
			return (currentSettings.size === 'big') ? '1.4em' : '.6em';
		}

		function getTextY(height) {
			if (currentSettings.size === 'big')
				return (currentSettings.chart === true) ? (height/2.5) : height/2;
			else
				return (currentSettings.chart === true) ? (height/3) : height/2;
		}

		function getText(value) {
			var text;
			if (_.isNumber(value)) {
				if (option.metricPrefix) {
					var prefix = d3.formatPrefix(value);
					text = prefix.scale(value).toFixed(option.decimal) + prefix.symbol;
				} else {
					var f;
					if (option.comma === true)
						f = d3.format(',.' + option.decimal + 'f');
					else
						f = d3.format('.' + option.decimal + 'f');
					text = f(value);
				}
			} else {
				text = value;
			}
			return text;
		}

		function getChartHeight(rc) {
			return rc.height/3;
		}

		function getChartWidth(rc) {
			return rc.width - (option.chart.margin.left + option.chart.margin.right);
		}

		function getChartTranslateText(rc) {
			var transX = option.chart.margin.left;
			var transY = rc.height - d3var.chart.height - option.chart.margin.bottom;
			return 'translate(' + transX + ', ' + transY + ')';
		}

		function getChartForPath() {
			var chart;
			switch (option.chart.type) {
			case 'line':
				chart = d3var.chart.line;
				break;
			case 'area':
				chart = d3var.chart.area;
				break;
			default:
				chart = d3var.chart.line;
				break;
			}
			return chart;
		}

		function resize() {
			if (_.isNull(d3var.svg))
				return;

			var rc = widgetElement[0].getBoundingClientRect();

			d3var.svg.attr('height', rc.height);
			d3var.svg.attr('width', rc.width);

			d3var.gText.attr('transform', 'translate(0,' + getTextY(rc.height) + ')');

			if (currentSettings.chart) {
				d3var.chart.height = getChartHeight(rc);
				d3var.chart.width = getChartWidth(rc);

				d3var.chart.xScale.range([0, d3var.chart.width]);
				d3var.chart.yScale.range([d3var.chart.height, 0]);

				d3var.chart.xRevScale.domain(d3var.chart.xScale.range());

				d3var.gChart.attr('transform', getChartTranslateText(rc));

				d3var.gChart.select('path')
						.attr('d', getChartForPath())
						.attr('transform', null);

				d3var.gChart.select('rect')
						.attr('width', d3var.chart.width)
						.attr('height', d3var.chart.height);

				d3var.gChart.selectAll('circle')
						.attr({
							cx: function(d, i) { return d3var.chart.xScale(i); },
							cy: function(d, i) { return d3var.chart.yScale(d); },
						});
			}
		}

		function createChart(rc) {
			destroyChart();

			d3var.chart.height = getChartHeight(rc);
			d3var.chart.width = getChartWidth(rc);

			var _highlightSpot = function(x, show) {
				var _hide = function(idx) {
					if (d3var.chart.highlightIndex === -1)
						return;
					if (idx === d3var.chart.minValIndex || idx === d3var.chart.maxValIndex) {
						var clr = (idx === d3var.chart.minValIndex) ? option.chart.spotcolor.min : option.chart.spotcolor.max;
						d3.select(d3var.gChart.selectAll('circle')[0][idx])
									.attr('fill', clr);
						return;
					}
					d3.select(d3var.gChart.selectAll('circle')[0][idx]).style('display', 'none');
				};

				if (show) {
					_hide(d3var.chart.highlightIndex);
					d3var.chart.highlightIndex = Math.round(d3var.chart.xRevScale(x));

					d3.select(d3var.gChart.selectAll('circle')[0][d3var.chart.highlightIndex])
									.style('display', 'block')
									.attr('fill', option.chart.spotcolor.def);
				} else {
					_hide(d3var.chart.highlightIndex);
					d3var.chart.highlightIndex = -1;
				}
			};

			var _showTooltip = function() {
				if (d3var.chart.highlightIndex === -1)
					return;
				d3var.gChart.gTooltip
							.style('left', (d3.event.pageX + 10) + 'px')
							.style('top', (d3.event.pageY - 28) + 'px')
							.style('display', 'inline');
			};

			var _hideTooltip = function() {
				d3var.gChart.gTooltip.style('display', 'none');
			};

			var _updateTooltip = function() {
				if (d3var.chart.highlightIndex === -1)
					return;

				var val = d3var.chart.data[d3var.chart.highlightIndex];

				d3var.gChart.gTooltip.html(getText(val) + ' ' + currentSettings.units)
							.style('left', (d3.event.pageX + 10) + 'px')
							.style('top', (d3.event.pageY - 28) + 'px');
			};

			d3var.chart.data = [];

			d3var.chart.xScale = d3.scale.linear()
				.domain([0, 1])
				.range([0, d3var.chart.width]);

			d3var.chart.xRevScale = d3.scale.linear()
				.domain(d3var.chart.xScale.range())
				.range(d3var.chart.xScale.domain());

			d3var.chart.yScale = d3.scale.linear()
				.domain([0, 1])
				.range([d3var.chart.height, 0]);

			d3var.gChart = d3var.svg.insert('g', 'g')
				.attr('transform', getChartTranslateText(rc));

			switch (option.chart.type) {
			case 'line':
				d3var.chart.line = d3.svg.line()
					.interpolate('linear')
					.x(function(d, i) { return d3var.chart.xScale(i); })
					.y(function(d, i) { return d3var.chart.yScale(d); });
				d3var.gChart.append('path')
						.datum(d3var.chart.data)
						.attr('d', d3var.chart.line)
						.attr('fill', 'none')
						.attr('stroke', option.chart.color)
						.attr('stroke-width', option.chart.lineWidth + 'px');
				break;
			case 'area':
				d3var.chart.area = d3.svg.area()
					.x(function(d, i) { return d3var.chart.xScale(i); })
					.y0(function(d, i) { return d3var.chart.yScale(0); })
					.y1(function(d, i) { return d3var.chart.yScale(d); });
				d3var.gChart.append('path')
							.datum(d3var.chart.data)
							.attr('d', d3var.chart.area)
							.attr('fill', option.chart.color);
				break;
			}

			d3var.gChart.append('rect')
					.attr('fill', 'none')
					.attr('pointer-events', 'all')
					.attr('width', d3var.chart.width)
					.attr('height', d3var.chart.height)
					.on('mousemove', function() {
						var m = d3.mouse(this);
						_highlightSpot(m[0], true);
						_updateTooltip();
					})
					.on('mouseover', function() {
						var m = d3.mouse(this);
						_highlightSpot(m[0], true);
						_showTooltip();
					})
					.on('mouseout', function() {
						var m = d3.mouse(this);
						_highlightSpot(m[0], false);
						_hideTooltip();
					});

			d3var.gChart.gTooltip = d3.select('body').append('div')
						.attr('class', 'tw-tooltip')
						.style('display', 'none');
		}

		function destroyChart() {
			if (_.isNull(d3var.gChart))
				return;
			d3var.chart.data = null;
			d3var.gChart.gTooltip.remove();
			d3var.gChart.remove();
			d3var.gChart = null;
		}

		function createWidget() {
			var rc = widgetElement[0].getBoundingClientRect();

			d3var.svg = d3.select('#' + currentID)
				.append('svg')
				.attr('width', rc.width)
				.attr('height', rc.height);

			d3var.gText = d3var.svg.append('g')
				.attr('transform', 'translate(0,' + getTextY(rc.height) + ')');

			d3var.textValue = d3var.gText.append('text')
				.data([{ value: 0 }])
				.text('0')
				.attr('fill', option.fontColor)
				.attr('text-anchor', 'center')
				.attr('dy', '.3em')
				.attr('font-size', getFontSize())
				.attr('class', 'ultralight-text');

			d3var.textUnits = d3var.gText.append('text')
				.text(currentSettings.units)
				.attr('fill', option.fontColor)
				.attr('text-anchor', 'central')
				.attr('dy', getUnitDy())
				.attr('font-size', '1em')
				.attr('class', 'ultralight-text');

			moveTextUnits();

			if (currentSettings.chart)
				createChart(rc);
		}

		function moveTextUnits() {
			if (_.isNull(d3var.svg))
				return;
			d3var.textUnits.attr('x', d3var.textValue.node().getBBox().width + 10);
		}

		function valueTransition(val) {
			d3var.textValue.transition()
				.duration(option.transition.duration)
				.ease(option.transition.type)
				.tween('text', function(d) {
					var i = d3.interpolate(d.value, val);
					d.value = val;
					return function(t) {
						this.textContent = getText(i(t));
						moveTextUnits();
					};
				});
		}

		function chartTransition(val) {
			d3var.chart.data.push(val);

			var minval = d3.min(d3var.chart.data);
			var maxval = d3.max(d3var.chart.data);

			d3var.chart.xScale
				.domain([0, d3var.chart.data.length-1]);
			d3var.chart.yScale
				.domain([minval, maxval])
				.range([d3var.chart.height, 0]);
			d3var.chart.xRevScale
				.range(d3var.chart.xScale.domain());

			var _getSpotColor = function(d, i) {
				if (d3var.chart.highlightIndex === i)
					return option.chart.spotcolor.def;

				if (minval === d && d3var.chart.minValIndex === i)
					return option.chart.spotcolor.min;
				else if (maxval === d && d3var.chart.maxValIndex === i)
					return option.chart.spotcolor.max;
				return 'none';
			};

			var _getSpotDisplay = function(d, i) {
				if (d3var.chart.highlightIndex === i)
					return 'block';

				if (minval === maxval)
					return 'none';

				if (minval === d) {
					d3var.chart.minValIndex = i;
					return 'block';
				}
				if (maxval === d) {
 					d3var.chart.maxValIndex = i;
 					return 'block';
				}
				return 'none';
			};

			d3var.gChart.selectAll('circle')
					.data(d3var.chart.data)
				.enter().insert('circle', 'rect')
					.style('display', 'none')
					.attr({
						cx: function(d, i) { return d3var.chart.xScale(i); },
						cy: function(d, i) { return d3var.chart.yScale(d); },
						r: option.chart.spotsize,
						fill: 'none'
					});

			if (d3var.chart.data.length > d3var.chart.xTickcount) {
				d3.transition()
					.duration(option.chart.transition.duration)
					.ease(option.chart.transition.type)
					.each(function () {
						d3var.gChart.select('path')
								.attr('d', getChartForPath())
								.attr('transform', null)
							.transition()
								.attr('transform', 'translate(' + d3var.chart.xScale(-1) + ')');

						// remove first circle
						d3var.gChart.select('circle').remove();

						d3var.gChart.selectAll('circle')
								.style('display', function(d, i) {
									return _getSpotDisplay(d, i);
								})
								.attr('fill', function(d, i) {
									return _getSpotColor(d, i);
								})
								.attr('cy', function(d, i) { return d3var.chart.yScale(d); })
							.transition()
								.attr('cx', function(d, i) { return d3var.chart.xScale(i); });
					});
			} else {
				d3.transition()
					.duration(option.chart.transition.duration)
					.ease(option.chart.transition.type)
					.each(function () {
						d3var.gChart.selectAll('circle')
							.style('display', function(d, i) {
								return _getSpotDisplay(d, i);
							})
							.attr('fill', function(d, i) {
								return _getSpotColor(d, i);
							})
							.transition()
								.attr('cx', function(d, i) { return d3var.chart.xScale(i); })
								.attr('cy', function(d, i) { return d3var.chart.yScale(d); });

						d3var.gChart.select('path').transition()
								.attr('d', getChartForPath());
					});
			}

			if (d3var.chart.data.length > d3var.chart.xTickcount)
				d3var.chart.data.shift();
		}

		function refresh(value) {
			if (option.transition.enable && _.isNumber(value))
				valueTransition(value);
			else {
				d3var.textValue.text(getText(value));
				moveTextUnits();
			}

			if (!_.isNull(d3var.gChart) && _.isNumber(value))
				chartTransition(value);
		}

		function setBlocks(blocks) {
			if (_.isUndefined(blocks))
				return;
			var titlemargin = (titleElement.css('display') === 'none') ? 0 : titleElement.outerHeight();
			var height = (BLOCK_HEIGHT) * blocks - PADDING - titlemargin;
			widgetElement.css({
				height: height + 'px',
				width: '100%'
			});
			resize();
		}

		this.render = function (element) {
			$(element).append(titleElement).append(widgetElement);
			titleElement.html((_.isUndefined(currentSettings.title) ? '' : currentSettings.title));
			setBlocks(self.getHeight());
			createWidget();
		};

		this.onSettingsChanged = function (newSettings) {
			option.decimal = newSettings.decimal;
			option.comma = newSettings.comma;
			option.metricPrefix = newSettings.metric_prefix;
			option.transition.enable = newSettings.animate;
			option.chart.type = newSettings.chart_type;
			option.chart.color = newSettings.chart_color;
			option.chart.spotcolor.min = option.chart.spotcolor.max = newSettings.chart_minmax_color;

			if (_.isNull(d3var.svg)) {
				currentSettings = newSettings;
				return;
			}

			titleElement.html((_.isUndefined(newSettings.title) ? '' : newSettings.title));
			if (_.isUndefined(newSettings.title) || newSettings.title === '')
				titleElement.css('display', 'none');
			else
				titleElement.css('display', 'block');

			if (currentSettings.chart !== newSettings.chart ||
				currentSettings.chart_type !== newSettings.chart_type) {
				if (newSettings.chart || currentSettings.chart_type !== newSettings.chart_type)
					createChart(widgetElement[0].getBoundingClientRect());
				else
					destroyChart();
			}

			var updateCalculate = false;
			if (currentSettings.value != newSettings.value)
				updateCalculate = true;

			currentSettings = newSettings;

			setBlocks(self.getHeight());

			d3var.textUnits.text(currentSettings.units);
			d3var.textUnits.attr('dy', getUnitDy());
			d3var.textValue.attr('font-size', getFontSize());
			moveTextUnits();

			if (currentSettings.chart) {
				switch (option.chart.type) {
				case 'line':
					d3var.gChart.select('path').attr('stroke', option.chart.color);
					break;
				case 'area':
					d3var.gChart.select('path').attr('fill', option.chart.color);
					break;
				}

				if (d3var.chart.minValIndex !== -1) {
					d3.select(d3var.gChart.selectAll('circle')[0][d3var.chart.minValIndex])
								.attr('fill', option.chart.spotcolor.min);
				}
				if (d3var.chart.maxValIndex !== -1) {
					d3.select(d3var.gChart.selectAll('circle')[0][d3var.chart.maxValIndex])
								.attr('fill', option.chart.spotcolor.max);
				}
			}

			return updateCalculate;
		};

		this.onCalculatedValueChanged = function (settingName, newValue) {
			if (settingName === 'value')
				refresh(newValue);
		};

		this.onSizeChanged = function() {
			resize();
		};

		this.onDispose = function () {
			if (!_.isNull(d3var.svg)) {
				destroyChart();
				d3var.gText.remove();
				d3var.gText = null;
				d3var.svg.remove();
				d3var.svg = null;
			}
		};

		this.getHeight = function () {
			return (currentSettings.size === 'big' || currentSettings.chart === true) ? 2 : 1;
		};

		this.onSettingsChanged(settings);
	};

	freeboard.loadWidgetPlugin({
		type_name: 'text_widget',
		display_name: 'テキスト',
		description: 'テキストと簡易チャートが表示できるウィジェットです。',
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
				name: 'decimal',
				display_name: '表示小数点以下桁数',
				type: 'number',
				validate: 'required,custom[integer],min[0],max[20]',
				style: 'width:100px',
				default_value: 0
			},
			{
				name: 'comma',
				display_name: 'カンマ表示',
				type: 'boolean',
				default_value: false,
			},
			{
				name: 'metric_prefix',
				display_name: '国際単位系表示',
				type: 'boolean',
				default_value: false,
				description: '1000なら1Kのように値を短縮します。'
			},
			{
				name: 'units',
				display_name: '単位',
				validate: 'optional,maxSize[20]',
				type: 'text',
				style: 'width:150px',
				description: '最大20文字'
			},
			{
				name: 'animate',
				display_name: '値変化アニメーション',
				type: 'boolean',
				default_value: true
			},
			{
				name: 'chart',
				display_name: '簡易チャートを含む',
				type: 'boolean'
			},
			{
				name: 'chart_type',
				display_name: 'チャートタイプ',
				type: 'option',
				options: [
					{
						name: 'ライン',
						value: 'line'
					},
					{
						name: 'エリア',
						value: 'area'
					}
				]
			},
			{
				name: 'chart_color',
				display_name: 'チャート色',
				validate: 'required,custom[hexcolor]',
				type: 'color',
				default_value: '#ff9900',
				description: 'デフォルト色: #ff9900'
			},
			{
				name: 'chart_minmax_color',
				display_name: 'チャート最大最小値色',
				validate: 'required,custom[hexcolor]',
				type: 'color',
				default_value: '#0496ff',
				description: 'デフォルト色: #0496ff'
			}
		],
		newInstance: function (settings, newInstanceCallback) {
			newInstanceCallback(new textWidget(settings));
		}
	});
}());
