//= require jquery/plugins/jquery.nearest

/*global sparks $ */


(function() {

  sparks.AddComponentsView = function(section){
    var self = this;

    this.section = section;
    this.$drawer = $("#component_drawer").empty();

    this.lastHighlightedHole = null;

    // create drawer
    this.$drawer.append(
     $("<img id='add_resistor' class='add_component'>").attr("src", "common/images/blank-resistor.png").draggable({
      containment: "#breadboard_wrapper",
      helper: "clone",
      start: function() {
        $("#add_resistor").hide().fadeIn(1200);
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

    // todo: don't add this twice
    $("#breadboard").droppable({
      drop: function(evt, ui) {
        var section = sparks.activityController.currentSection,
            hole = self.lastHighlightedHole.attr("hole"),
            loc = hole + "," + hole,
            uid, comp;

        // insert component into highlighted hole
        uid = breadModel("insertComponent", "resistor", {
         "type": "resistor",
         "draggable": true,
         "resistance": "100",
         "connections": loc
        });

        comp = getBreadBoard().components[uid];

        // move leads to correct width
        breadModel("checkLocation", comp);

        // update meters
        section.meter.update();

        // create editor tooltip
        resValues = [];
        baseValues = sparks.circuit.r_values.r_values4band10pct;

        for (i = 0; i < 6; i++) {
          for (j = 0; j < baseValues.length; j++) {
            resValues.push(baseValues[j] * Math.pow(10, i));
          }
        }

        componentValueChanged = function (evt, ui) {
          var val = resValues[ui.value],
              eng = sparks.unit.toEngineering(val, "\u2126"),
              comp = getBreadBoard().components[uid];
          $("#res_value").text(eng.value + eng.units);
          comp.setResistance(val);
          sparks.breadboardView.changeResistorColors(uid, comp.getViewArguments().color);
          section.meter.update();
        }

        $editor = $("<div class='editor'>").append(
          $("<h3>").text("Edit Resistor")
        ).append(
          $("<div>").slider({
            max: resValues.length-1,
            slide: componentValueChanged,
            value: baseValues.length
          })
        ).append(
          $("<div>").html("Resistance: <span id='res_value'>100\u2126</span>")
        ).append(
          $("<button>").text("Remove").on('click', function() {
            sparks.breadboardView.removeComponent(uid);
            $(".speech-bubble").trigger('mouseleave');
          })
        ).css( { width: 120, textAlign: "right" } );

        sparks.breadboardView.showTooltip(uid, $editor);
      }
    })
  };

  sparks.AddComponentsView.prototype = {

    openPane: function() {
      $("#component_drawer").animate({left: 0}, 300, function(){
        $("#add_components").css("overflow", "visible");
      });
    }

  };
})();