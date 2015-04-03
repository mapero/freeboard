(function() {
  'use strict';

  var plugin_wg_button = function(settings)
  {
    var self = this;
    var isChecked = false;
    
    var titleElement = $('<h2 class="section-title"></h2>');

    //Toggle Button
    var toggleContainer = $('<div></div>');
    var toggleElement = $('<input type="checkbox">');
    var labelElement = $('<label style="width: 100%;"></label>');
    toggleElement.uniqueId();
    labelElement.prop('for', toggleElement.prop('id'));
    toggleContainer.append(toggleElement).append(labelElement);
    $(function() {
      toggleElement.button({
        label: settings.label,
        icons: {
          primary: settings.icon
        }
      });
    });

    //Simple Button
    var switchElement = $('<button style="width: 100%"></button>');
    $(function() {
      switchElement.button({
        label: settings.label,
        icons: {
          primary: settings.icon
        }
      });
    });

    self.render = function(containerElement)
    {
      if (self.currentSettings.style === "switch")
      {
        $(containerElement).append(titleElement).append(toggleContainer);

        toggleElement.button("refresh");
      };
      if (self.currentSettings.style === "trigger")
      {
        $(containerElement).append(titleElement).append(switchElement);
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
      
      if (newSettings.style === "trigger") {
        switchElement.button( "option", "label", newSettings.label );
        switchElement.button("option", "icons", { primary: _.isUndefined(newSettings.icon) ? 'ui-icon-blank' : newSettings.icon});
        switchElement.click( Function(newSettings.click_fn) );
        switchElement.button("refresh");
      }
      if (newSettings.style === "switch") {
        toggleElement.button( "option", "label", newSettings.label );
        toggleElement.button("option", "icons", { primary: _.isUndefined(newSettings.icon) ? 'ui-icon-blank' : newSettings.icon});
        toggleElement.click( Function(newSettings.click_fn) );
        toggleElement.button("refresh");
      }
      self.currentSettings = newSettings;
    };

    self.onCalculatedValueChanged = function(settingName, newValue)
    {
      if (settingName === "value") {
        toggleElement.prop('checked', Boolean(newValue));
        toggleElement.button("refresh");
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
        name: "label",
        display_name: "Label",
        type: "text"
      },
      {
        name: "style",
        display_name: "Button Style",
        type: "option",
        options: [
          {
            name: "Trigger",
            value: "trigger"
          },
          {
            name: "Toggle Switch",
            value: "switch"
          }
        ]
      },
      {
        name: "icon",
        display_name: "Icon class name",
        type: "text"
      },
      {
        name: "value",
        display_name: "Value",
        type: "calculated"
      },
      {
        name: "click_fn",
        display_name: "Click function",
        type: "json",
        validate: 'optional,maxSize[5000]'
      }
    ],
    newInstance: function(settings, newInstanceCallback)
    {
      newInstanceCallback(new plugin_wg_button(settings));
    }
  });
}());
