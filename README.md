SensorCorpus Dashboard
==========

IoT (sensors, etc.) for layout editable dashboard.

IoT(センサー等)向けレイアウト編集可能なダッシュボード

### Demo
[http://infocorpus.github.io/freeboard/](http://infocorpus.github.io/freeboard/)

[Open Weather Map Sample English version](http://infocorpus.github.io/freeboard/?load=http%3A%2F%2Finfocorpus.github.io%2Ffreeboard%2Fexamples%2Fopen-weathermap-sample-en.json)

[Open Weather Map Sample Japanese version](http://infocorpus.github.io/freeboard/?load=http%3A%2F%2Finfocorpus.github.io%2Ffreeboard%2Fexamples%2Fopen-weathermap-sample.json)

[ChartWidget Sample 1](http://infocorpus.github.io/freeboard/?load=http%3A%2F%2Finfocorpus.github.io%2Ffreeboard%2Fexamples%2Fc3transform_sample01.json)

[ChartWidget Sample 2](http://infocorpus.github.io/freeboard/?load=http%3A%2F%2Finfocorpus.github.io%2Ffreeboard%2Fexamples%2Fc3showcase(laggy).json)

[GaugeWidget Sample](http://infocorpus.github.io/freeboard/?load=http%3A%2F%2Finfocorpus.github.io%2Ffreeboard%2Fexamples%2Fgauge_sample.json)

[TextWidget Sample](http://infocorpus.github.io/freeboard/?load=http%3A%2F%2Finfocorpus.github.io%2Ffreeboard%2Fexamples%2Ftextwidget_sample.json)

### Screenshot

English version
![weather-en](https://raw.githubusercontent.com/wiki/infocorpus/freeboard/images/screenshot01-en.png)

Japanese version
![weather](https://raw.githubusercontent.com/wiki/infocorpus/freeboard/images/screenshot01.png)

### What is this?

Freeboard is a turn-key HTML-based "engine" for dashboards. Besides a nice looking layout engine, it provides a plugin architecture for creating datasources (which fetch data) and widgets (which display data)— freeboard then does all the work to connect the two together. Another feature of freeboard is its ability to run entirely in the browser as a single-page static web app without the need for a server. The feature makes it extremely attractive as a front-end for embedded devices which may have limited ability to serve complex and dynamic web pages.

The code here is the client-side portion of what you see when you visit a freeboard at http://freeboard.io. It does not include any of the server-side code for user management, saving to a database or public/private functionality— this is left up to you to implement should you want to use freeboard as an online service.

簡単に言うと、あらゆるWEB APIから取得したJSONデータを、各種ウィジェットに関連付けし
そのウィジェットをドラッグアンドドロップで自由に配置することができる
Webアプリケーションです。

### How to use

Freeboard can be run entirely from a local hard drive. Simply download/clone the repository and open index.html. When using Chrome, you may run into issues with CORS when accessing JSON based APIs if you load from your local hard-drive— in this case you can switch to using JSONP or load index.html and run from a local or remote web server.

[サンプルディレクトリ](https://github.com/infocorpus/freeboard/tree/master/examples)
にダッシュボード設定サンプルJSONファイルがあります。ダウンロードしてダッシュボードメニューからロードして下さい。

### For more information

TODO

### The following language support

English<br />
Japanese

### License

Copyright © 2013 Jim Heising ([https://github.com/jheising](https://github.com/jheising))<br/>Copyright © 2013 Bug Labs, Inc. ([http://buglabs.net](http://buglabs.net))<br/>
Copyright © 2015 Daisuke Tanaka ([https://github.com/tanaka0323](https://github.com/tanaka0323))<br/>Copyright © 2015 Infocorpus, Inc. ([http://www.infocorpus.co.jp](http://www.infocorpus.co.jp))<br/>Licensed under the **MIT** license.
