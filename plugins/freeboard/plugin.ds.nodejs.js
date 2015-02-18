// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ F R E E B O A R D                                                                                                                      │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2014 Hugo Sequeira (https://github.com/hugocore)                                                                           │ \\
// │ Copyright © 2015 Daisuke Tanaka (https://github.com/tanaka0323)                                                                        │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                                                                                        │ \\
// └────────────────────────────────────────────────────────────────────┘ \\

(function() {

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
