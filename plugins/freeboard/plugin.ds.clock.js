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
		}

		this.onDispose = function () {
			stopTimer();
		}

		this.onSettingsChanged = function (newSettings) {
			currentSettings = newSettings;
			if (_.isUndefined(currentSettings.timezone))
				currentSettings.timezone = 'Asia/Tokyo';
			updateTimer();
		}

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
