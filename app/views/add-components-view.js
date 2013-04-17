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