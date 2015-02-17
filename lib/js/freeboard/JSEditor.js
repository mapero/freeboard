// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ F R E E B O A R D                                                  │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2013 Jim Heising (https://github.com/jheising)         │ \\
// │ Copyright © 2013 Bug Labs, Inc. (http://buglabs.net)               │ \\
// │ Copyright © 2015 Daisuke Tanaka (https://github.com/tanaka0323)    │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT license.                                    │ \\
// └────────────────────────────────────────────────────────────────────┘ \\

JSEditor = function () {
	var assetRoot = ""

	function setAssetRoot(_assetRoot) {
		assetRoot = _assetRoot;
	}

	function displayJSEditor(value, mode, callback) {

		var exampleText;
		var codeWindow = $('<div class="code-window"></div>');
		var codeMirrorWrapper = $('<div class="code-mirror-wrapper"></div>');
		var codeWindowFooter = $('<div class="code-window-footer"></div>');
		var codeWindowHeader = $('<div class="code-window-header cm-s-ambiance"></div>');
		var config = {};

		switch (mode) {
			case 'javascript':
				exampleText = '// 例: return datasouces["test"]["value"];';
				codeWindowHeader = $('<div class="code-window-header cm-s-ambiance">このJavaScriptは、参照データソースが更新されるたびに再評価され、<span class="cm-keyword">戻り値</span>がウィジェットに表示されます。関数 <code><span class="cm-keyword">function</span>(<span class="cm-def">datasources</span>)</code> の内部をJavaScriptで記述することができます。引数 <span class="cm-def">datasources</span> は追加したデータソースの配列です。また引数 <span class="cm-def">_global</span> へスクリプト外スコープの変数を格納することができます。(注:異なるスクリプト間では共有できません。)</div>');

				// If value is empty, go ahead and suggest something
				if (!value)
					value = exampleText;

				config = {
					value: value,
					mode: "javascript",
					theme: "ambiance",
					indentUnit: 4,
					lineNumbers: true,
					matchBrackets: true,
					autoCloseBrackets: true,
					gutters: ["CodeMirror-lint-markers"],
					lint: true
				};
				break;
			case 'json':
				exampleText = '// 例: {\n//    "title": "タイトル"\n//    "value": 10\n}';
				codeWindowHeader = $('<div class="code-window-header cm-s-ambiance"><span class="cm-keyword">JSON</span>形式のデータを入力して下さい。</div>');

				config = {
					value: value,
					mode: "application/json",
					theme: "ambiance",
					indentUnit: 4,
					lineNumbers: true,
					matchBrackets: true,
					autoCloseBrackets: true,
					gutters: ["CodeMirror-lint-markers"],
					lint: true
				};
				break;
		}

		codeWindow.append([codeWindowHeader, codeMirrorWrapper, codeWindowFooter]);

		$("body").append(codeWindow);

		var codeMirrorEditor = CodeMirror(codeMirrorWrapper.get(0), config);

		var closeButton = $('<span id="dialog-cancel" class="text-button">閉じる</span>').click(function () {
			if (callback) {
				var newValue = codeMirrorEditor.getValue();

				if (newValue === exampleText) {
					newValue = "";
				}

				var error = null;
				switch (mode) {
					case 'json':
						if (JSHINT.errors.length > 0) {
							alert("Please correct the json error.");
							return;
						}
						break;
				}
				callback(newValue);
				codeWindow.remove();
			}
		});

		codeWindowFooter.append(closeButton);
	}

	// Public API
	return {
		displayJSEditor: function (value, mode, callback) {
			displayJSEditor(value, mode, callback);
		},
		setAssetRoot: function (assetRoot) {
			setAssetRoot(assetRoot)
		}
	}
}
