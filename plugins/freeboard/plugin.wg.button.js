(function() {
  'use strict';

  //Toogle Button Style
  freeboard.addStyle(".switch", 'float: left; position: relative; display: inline-block; vertical-align: top; margin-top: 5px; margin-right: 10px; width: 56px; height: 20px; padding: 3px; background-color: white; border-radius: 18px; box-shadow: inset 0 -1px white, inset 0 1px 1px rgba(0, 0, 0, 0.05); cursor: pointer; background-image: -webkit-linear-gradient(top, #eeeeee, white 25px); background-image: -moz-linear-gradient(top, #eeeeee, white 25px); background-image: -o-linear-gradient(top, #eeeeee, white 25px); background-image: linear-gradient(to bottom, #eeeeee, white 25px);');
  freeboard.addStyle(".switch-input","position: absolute; top: 0; left: 0; opacity: 0;");
  freeboard.addStyle(".switch-label","position: relative; display: block; height: inherit; font-size: 10px; text-transform: uppercase; background: #eceeef; border-radius: inherit; box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.12), inset 0 0 2px rgba(0, 0, 0, 0.15); -webkit-transition: 0.15s ease-out; -moz-transition: 0.15s ease-out; -o-transition: 0.15s ease-out;  transition: 0.15s ease-out; -webkit-transition-property: opacity background; -moz-transition-property: opacity background; -o-transition-property: opacity background; transition-property: opacity background;");
  freeboard.addStyle(".switch-label:before, .switch-label:after","position: absolute; top: 50%; margin-top: -.5em; line-height: 1; -webkit-transition: inherit; -moz-transition: inherit; -o-transition: inherit; transition: inherit;");
  freeboard.addStyle(".switch-label:before","content: attr(data-off); right: 11px; color: #aaa; text-shadow: 0 1px rgba(255, 255, 255, 0.5);");
  freeboard.addStyle(".switch-label:after","content: attr(data-on); left: 11px; color: white; text-shadow: 0 1px rgba(0, 0, 0, 0.2); opacity: 0;");
  freeboard.addStyle(".switch-input:checked ~ .switch-label","background: #47a8d8; box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15), inset 0 0 3px rgba(0, 0, 0, 0.2);");
  freeboard.addStyle(".switch-input:checked ~ .switch-label:before","opacity: 0;");
  freeboard.addStyle(".switch-input:checked ~ .switch-label:after","opacity: 1;");
  freeboard.addStyle(".switch-handle","position: absolute; top: 4px; left: 4px; width: 18px; height: 18px; background: white; border-radius: 10px; box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2); background-image: -webkit-linear-gradient(top, white 40%, #f0f0f0); background-image: -moz-linear-gradient(top, white 40%, #f0f0f0); background-image: -o-linear-gradient(top, white 40%, #f0f0f0); background-image: linear-gradient(to bottom, white 40%, #f0f0f0); -webkit-transition: left 0.15s ease-out; -moz-transition: left 0.15s ease-out; -o-transition: left 0.15s ease-out; transition: left 0.15s ease-out;");
  freeboard.addStyle(".switch-handle:before","content: ''; position: absolute; top: 50%; left: 50%; margin: -6px 0 0 -6px; width: 12px; height: 12px; background: #f9f9f9; border-radius: 6px; box-shadow: inset 0 1px rgba(0, 0, 0, 0.02); background-image: -webkit-linear-gradient(top, #eeeeee, white); background-image: -moz-linear-gradient(top, #eeeeee, white); background-image: -o-linear-gradient(top, #eeeeee, white); background-image: linear-gradient(to bottom, #eeeeee, white);");
  freeboard.addStyle(".switch-input:checked ~ .switch-handle","left: 40px; box-shadow: -1px 1px 5px rgba(0, 0, 0, 0.2);");

  //Round Button Style
  freeboard.addStyle(".wg_button","margin: 1px;");
  freeboard.addStyle(".wg_button a", "z-index: 1; width: 32px;	height: 32px;	display: inline-block; position: relative;	line-height: 32px; background-color: #eaeaea;	background-image: -webkit-gradient(linear, left top, left bottom, from(#f6f6f6), to(#eaeaea));	background-image: -webkit-linear-gradient(top, #f6f6f6, #eaeaea);	background-image: -moz-linear-gradient(top, #f6f6f6, #eaeaea); 	background-image: -ms-linear-gradient(top, #f6f6f6, #eaeaea); 	background-image: -o-linear-gradient(top, #f6f6f6, #eaeaea);	background-image: linear-gradient(top, #f6f6f6, #eaeaea);	-moz-border-radius: 16px;	-webkit-border-radius: 16px;	border-radius: 16px;	-moz-box-shadow: 0 1px 1px rgba(0, 0, 0, .25), 0 2px 3px rgba(0, 0, 0, .1);	-webkit-box-shadow: 0 1px 1px rgba(0, 0, 0, .25), 0 2px 3px rgba(0, 0, 0, .1);	box-shadow: 0 1px 1px rgba(0, 0, 0, .25), 0 2px 3px rgba(0, 0, 0, .1);");
  freeboard.addStyle(".wg_button a:active", "	top: 1px;	background-image: -webkit-gradient(linear, left top, left bottom, from(#eaeaea), to(#f6f6f6));	background-image: -webkit-linear-gradient(top, #eaeaea, #f6f6f6);	background-image: -moz-linear-gradient(top, #eaeaea, #f6f6f6); 	background-image: -ms-linear-gradient(top, #eaeaea, #f6f6f6); background-image: -o-linear-gradient(top, #eaeaea, #f6f6f6);	background-image: linear-gradient(top, #eaeaea, #f6f6f6);");
  freeboard.addStyle(".wg_button a:before","content: ''; position: absolute; z-index: -1;	top: -2px;	right: -2px;	bottom: -2px;	left: -2px;	background-color: #dae1f0;	-moz-border-radius: 70px;	-webkit-border-radius: 70px;	border-radius: 70px;	opacity: 0.5;");
  //freeboard.addStyle(".wg_button a:active::before","top: -9px;");
  //freeboard.addStyle(".wg_button a:hover::before","opacity: 1;");

  var plugin_wg_button = function(settings)
  {
    var self = this;
    var isChecked = false;
    
    var titleElement = $('<h2 class="section-title"></h2>');
    var descriptionElement = $('<div style="margin-top: 10px;"></div>');

    //Switch Button
    var labelElement = $('<label class="switch"></label>');
    var checkboxElement = $('<input type="checkbox" class="switch-input">');
    var checkboxLabelElement = $('<span class="switch-label" data-on="On" data-off="Off"></span>');
    var handleElement = $('<span class="switch-handle"></span>');
    labelElement.append(checkboxElement).append(checkboxLabelElement).append(handleElement);

    //Trigger Button
    var divElement =$('<div style="float: left; margin-right: 10px" class="wg_button"></div>');
    var linkElement = $('<a class="twitter"></a>');
    var iconElement = $('<img style="top: 0; bottom:0; left: 0; right:0; margin: auto; position: absolute; max-width: 30px; max-height: 30px;" src="http://azmind.com/demo/css3-circle-social-buttons/images/twitter.png"></img>');
    linkElement.append(iconElement);
    divElement.append(linkElement);

    self.onClick = function()
    {
      if (self.currentSettings.style === "switch") {
        var json = {};
        isChecked = checkboxElement.prop("checked");
        json.cmd = self.currentSettings.cmd;
        json.value = isChecked;
        $.post(self.currentSettings.post_url, json);
      }
      if (self.currentSettings.style === "trigger") {
        var json = {};
        json.cmd = self.currentSettings.cmd;
        $.post(self.currentSettings.post_url, json);
      }
    }

    self.updateState = function()
    {
        checkboxElement.prop('checked', isChecked);
    };

    self.render = function(containerElement)
    {
      if (self.currentSettings.style === "switch")
      {
        checkboxElement.bind("click", self.onClick);
        $(containerElement).append(titleElement).append(labelElement).append(descriptionElement);
      };
      if (self.currentSettings.style === "trigger")
      {
        $(divElement).bind("click", self.onClick);
        $(containerElement).append(titleElement).append(divElement).append(descriptionElement);
      };
    };

    self.getHeight = function()
    {
      console.log("getHeight");
      return 1;
    };

    self.onSettingsChanged = function(newSettings)
    {
      titleElement.html((_.isUndefined(newSettings.title) ? '' : newSettings.title));
      descriptionElement.text((_.isUndefined(newSettings.description) ? '' : newSettings.description));
      self.currentSettings = newSettings;
    };

    self.onCalculatedValueChanged = function(settingName, newValue)
    {
      if (settingName === "value") {
        isChecked = Boolean(newValue);
        self.updateState();
      }
    };

    self.onDispose = function()
    {
      console.log("disposed");
    };

    self.onSettingsChanged(settings);
  };

  freeboard.loadWidgetPlugin({
    type_name: "plugin_wg_button",
    display_name: "Button Plugin",
    description: "This Widget adds a Button to your Dashboard",
    fill_size: false,
    settings: [
      {
        name: "title",
        display_name: "Title",
        type: "text"
      },
      {
        name: "description",
        display_name: "Description",
        type: "text"
      },
      {
        name: "style",
        display_name: "Button Style",
        type: "text"
      },
      {
        name: "cmd",
        display_name: "Command Tag",
        type: "text"
      },
      {
        name: "value",
        display_name: "Value",
        type: "calculated"
      },
      {
        name: "post_url",
        display_name: "Post URL",
        type: "text"
      }
    ],
    newInstance: function(settings, newInstanceCallback)
    {
      newInstanceCallback(new plugin_wg_button(settings));
    }
  });
}());
