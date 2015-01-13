var unit        = require('../helpers/unit');

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
        self = this;
    // create editor tooltip
    possibleValues = comp.getEditablePropertyValues();

    componentValueChanged = function (evt, ui) {
      var val = possibleValues[ui.value],
          eng = unit.toEngineering(val, comp.editableProperty.units);
      $(".prop_value_"+uid).text(eng.value + eng.units);
      comp.changeEditableValue(val);
      section.meter.update();
    }

    if (comp.isEditable) {
      propertyName = comp.editableProperty.name.charAt(0).toUpperCase() + comp.editableProperty.name.slice(1);
      initialValue = comp[comp.editableProperty.name];
      initialValueEng = unit.toEngineering(initialValue, comp.editableProperty.units);
      initialValueText = initialValueEng.value + initialValueEng.units;
      $propertyEditor = $("<div>").append(
        $("<div>").slider({
          max: possibleValues.length-1,
          slide: componentValueChanged,
          value: possibleValues.indexOf(initialValue)
        })
      ).append(
        $("<div>").html(
          propertyName + ": <span class='prop_value_"+uid+"'>"+initialValueText+"</span>"
          )
      );
    }

    $editor = $("<div class='editor'>").append(
      $("<h3>").text("Edit "+comp.componentTypeName)
    ).append(
      $propertyEditor
    ).append(
      $("<button>").text("Remove").on('click', function() {
        self.breadboardController.removeComponent(comp);
        section.meter.update();
        $(".speech-bubble").trigger('mouseleave');
      })
    ).css( { width: 130, textAlign: "right" } );

    this.workbenchController.breadboardView.showTooltip(uid, $editor);
  }

};

module.exports = EditComponentsView;
