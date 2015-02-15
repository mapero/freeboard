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
		description: "GoogleMapを表示するウィジェットです。緯度経度に値を設定するとその周辺の地図が表示されます。",
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
}());
