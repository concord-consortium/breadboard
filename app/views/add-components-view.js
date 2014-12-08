unit = require('../helpers/unit');

var workbenchController;


embeddableComponents = {
  resistor: {
    image: "/common/images/blank-resistor.png",
    imageWidth: 108,
    property: "resistance",
    initialValue: 100
  },
  capacitor: {
    image: "/common/images/capacitor.png",
    imageWidth: 48,
    property: "capacitance",
    initialValue: 1e-6
  },
  inductor: {
    image: "/common/images/inductor.png",
    imageWidth: 80,
    property: "inductance",
    initialValue: 1e-6
  },
  wire: {
    image: "/common/images/wire.png",
    imageWidth: 80,
    leadDistance: 5
  }
}

AddComponentsView = function(workbench){
  workbenchController = require('../controllers/workbench-controller');

  var self = this,
      component;

  this.section = workbench;
  this.$drawer = $("#component_drawer").empty();

  this.lastHighlightedHole = null;

  if (workbenchController.breadboardView) {
    workbenchController.breadboardView.setRightClickFunction(this.showEditor);
  } else {  // queue it up
    workbench.view.setRightClickFunction(this.showEditor);
  }

  // create drawer
  for (componentName in embeddableComponents) {
    if (!embeddableComponents.hasOwnProperty(componentName)) continue;

    component = embeddableComponents[componentName];

    this.$drawer.append(
     $("<img class='add_"+componentName+"' class='add_component'>")
      .attr("src", component.image)
      .css("width", component.imageWidth)
      .data("type", componentName)
      .draggable({
        containment: "#breadboard_wrapper",
        helper: "clone",
        start: function(evt, ui) {
          $(ui.helper.context).hide().fadeIn(1200);
        },
        drag: function(evt, ui) {
          if (self.lastHighlightedHole) {
            self.lastHighlightedHole.attr("xlink:href", "#$:hole_not_connected");
          }
          loc = {x: ui.offset.left, y: ui.offset.top+(ui.helper.height()/2)};
          var nearestHole = $($.nearest(loc, "use[hole]")[0]);
          nearestHole.attr("xlink:href", "#$:hole_highlighted");
          self.lastHighlightedHole = nearestHole;
        }
      })
    );
  }

  // todo: don't add this twice
  $("#breadboard").droppable({
    drop: function(evt, ui) {
      var type = ui.draggable.data("type"),
          embeddableComponent = embeddableComponents[type],
          hole = self.lastHighlightedHole.attr("hole"),
          loc = hole + "," + hole,
          possibleValues,
          $propertyEditor = null,
          propertyName,
          initialValue, initialValueEng, initialValueText,
          $editor, props, uid, comp;

      if (embeddableComponent.leadDistance) {
        console.log(hole)
        var num = /\d*$/.exec(hole)[0] * 1;
        console.log(num)
        num = Math.max(num-embeddableComponent.leadDistance, 1);
        console.log(num)
        loc = loc.replace(/(\d*)$/, num);
        console.log(loc)
      }

      // insert component into highlighted hole
      props = {
       "type": type,
       "draggable": true,
       "connections": loc
      };
      props[embeddableComponent.property] = embeddableComponent.initialValue;
      uid = breadModel("insertComponent", type, props);

      comp = getBreadBoard().components[uid];

      // move leads to correct width
      breadModel("checkLocation", comp);

      // update meters
      workbench.meter.update();

      // show editor
      self.showEditor(uid);
    }
  })
};

AddComponentsView.prototype = {

  openPane: function() {
    $("#component_drawer").animate({left: 0}, 300, function(){
      $("#add_components").css("overflow", "visible");
    });
  },

  showEditor: function(uid) {
    var comp = getBreadBoard().components[uid],
        section = workbenchController.workbench,
        $propertyEditor = null;
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
        breadModel("removeComponent", comp);
        section.meter.update();
        $(".speech-bubble").trigger('mouseleave');
      })
    ).css( { width: 130, textAlign: "right" } );

    workbenchController.breadboardView.showTooltip(uid, $editor);
  }

};

module.exports = AddComponentsView;
