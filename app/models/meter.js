/*global sparks $ */

Meter = function() {};

Meter.prototype = {
  dmm: null,
  oscope: null,

  setProbeLocation: function (probe, loc) {
    if (this.oscope) {
      this.oscope.setProbeLocation(probe, loc);
    }
    if (this.dmm) {
      this.dmm.setProbeLocation(probe, loc);
    }
  },

  // moves any and all probes from oldLoc to newLoc
  // useful for when a lead with connected probes is moved
  moveProbe: function (oldLoc, newLoc) {
    if (this.oscope) {
      this.oscope.moveProbe(oldLoc, newLoc);
    }
    if (this.dmm) {
      this.dmm.moveProbe(oldLoc, newLoc);
    }
  },

  update: function () {
    if (this.oscope) {
      this.oscope.update();
    }
    if (this.dmm) {
      this.dmm.update();
    }
  },

  reset: function() {
    if (this.oscope && this.oscope.reset) {
      this.oscope.reset();
    }
    if (this.dmm && this.dmm.reset) {
      this.dmm.reset();
    }
  }
};

module.exports = Meter;
