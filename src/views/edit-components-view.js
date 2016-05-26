var LogEvent      = require('../models/log'),
    logController = require('../controllers/log-controller'),
    unit          = require('../helpers/unit');

EditComponentsView = function(workbenchController, breadboardController){
  this.workbenchController = workbenchController;
  this.breadboardController = breadboardController;

  if (workbenchController.breadboardView) {
    workbenchController.breadboardView.setRightClickFunction(this, "showEditor");
  } else {  // queue it up
    workbenchController.workbench.view.setRightClickFunction(this, "showEditor");
  }
};

EditComponentsView.prototype = {

  showEditor: function(uid) {
    var comp = this.breadboardController.getComponents()[uid],
        section = this.workbenchController.workbench,
        $propertyEditor = null,
        sliderChange, selectChange, updateValue, options,
        self = this;
    // create editor tooltip
    possibleValues = comp.getEditablePropertyValues();

    sliderChange = function (evt, ui) {
      updateValue(evt, possibleValues[ui.value]);
    }

    selectChange = function (evt) {
      updateValue(evt, this.value);
    }

    updateValue = function (evt, val) {
      var eng = unit.toEngineering(val, comp.editableProperty.units);
      $(".prop_value_"+uid).text(eng.value + eng.units);
      comp.changeEditableValue(val);
      logController.addEvent(LogEvent.CHANGED_CIRCUIT, {
        "type": "changed component value",
        "UID": comp.UID,
        "value": val,
        "via": evt.originalEvent ? evt.originalEvent.type || 'n/a' : 'n/a'
      });
      section.meter.update();
    }

    componentValueFinished = function (evt, ui) {
      if (evt.originalEvent && (evt.originalEvent.type == 'mouseup')) {
        logController.addEvent(LogEvent.CHANGED_CIRCUIT, {
          "type": "changed component value",
          "UID": comp.UID,
          "value": possibleValues[ui.value],
          "via": evt.originalEvent.type
        });
      }
    }

    if (comp.isEditable) {
      propertyName = comp.editableProperty.name.charAt(0).toUpperCase() + comp.editableProperty.name.slice(1);
      initialValue = comp[comp.editableProperty.name];
      initialValueEng = unit.toEngineering(initialValue, comp.editableProperty.units);
      initialValueText = initialValueEng.value + initialValueEng.units;

      if (this.workbenchController.breadboardView.useSelectInPropertyEditor) {
        options = $.map(possibleValues, function (value) {
          var eng = unit.toEngineering(value, comp.editableProperty.units);
          return ["<option value='", value, "'", value == initialValue ? " selected" : "", ">", eng.value, eng.units , "</option>"].join("");
        });
        $propertyEditor = $("<div>").append($("<div>").append($(["<select>", options.join("\n"), "</select>"].join("\n")).on('change', selectChange)));
      }
      else {
        $propertyEditor = $("<div>").append($("<div>").slider({
          max: possibleValues.length-1,
          slide: sliderChange,
          stop: componentValueFinished,
          value: possibleValues.indexOf(initialValue)
        })).append(
          $("<div>").html(propertyName + ": <span class='prop_value_"+uid+"'>"+initialValueText+"</span>")
        );
      }
    }

    $editor = $("<div class='editor'>").append(
      $("<h3>").text("Edit "+comp.componentTypeName)
    ).append(
      $propertyEditor
    ).css( { width: 130, textAlign: "right" } );

    // only allow removes when the components can be added back
    if (this.workbenchController.workbench.showComponentDrawer) {
      $editor.append(
        $("<button>").text("Remove").on('click', function() {
          self.breadboardController.removeComponent(comp);
          section.meter.update();
          $(".speech-bubble").trigger('mouseleave');
        })
      )
    }

    this.workbenchController.breadboardView.showTooltip(uid, $editor);
  }

};

module.exports = EditComponentsView;
