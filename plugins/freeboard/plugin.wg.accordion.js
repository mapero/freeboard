(function() {
  'use strict';

  var plugin_wg_button = function(settings)
  {
    var self = this;
    var isChecked = false;
    
    var titleElement = $('<h2 class="section-title"><button>x</button></h2>');
    var outerContainer =  $('<div></div>');
    var divContainer = $('<div style="overflow: scroll; height: 270px;"></div>');
    var sectionTitleElement = $('<h3></h3>');
    var sectionBodyElement = $('<div></div>');
    var clearButton = $('<button>Clear</button>');



    self.updateState = function()
    {
        //checkboxElement.prop('checked', isChecked);
    };

    self.render = function(containerElement)
    {
        $(containerElement).append(titleElement).append(outerContainer);
        $(outerContainer).append(clearButton).append(divContainer);
        $(function() {
          divContainer.accordion({
            header: "h2",
            heightStyle: "content",
            collapsible: true
          });
        });
        $(function() {
          clearButton.button().click(function(event) {
            divContainer.empty();  
          });
        });
    };

    self.getHeight = function()
    {
      return 6;
    };

    self.onSettingsChanged = function(newSettings)
    {
      titleElement.html((_.isUndefined(newSettings.title) ? '' : newSettings.title));
      self.currentSettings = newSettings;
    };

    self.onCalculatedValueChanged = function(settingName, newValue)
    {
      if (settingName === "value") {
        divContainer.append($('<h2>'+newValue.title+'</h2>'));
        divContainer.append($('<div>'+newValue.body+'</div>'));
        divContainer.accordion("refresh");
      };
    };

    self.onDispose = function()
    {

    };

    self.onSettingsChanged(settings);
  };

  freeboard.loadWidgetPlugin({
    type_name: "plugin_wg_accordion",
    display_name: "Accordion List Plugin",
    description: "This Widget adds a List object for any icoming event item",
    fill_size: false,
    settings: [
      {
        name: "title",
        display_name: "Title",
        type: "text"
      },
      {
        name: "value",
        display_name: "Value",
        type: "calculated"
      }
    ],
    newInstance: function(settings, newInstanceCallback)
    {
      newInstanceCallback(new plugin_wg_button(settings));
    }
  });
}());
