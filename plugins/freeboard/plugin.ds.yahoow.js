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