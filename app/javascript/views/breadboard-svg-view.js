/**
 * @author Mobile.Lab (http://mlearner.com)
 **/

window["breadboardView"] = {
  "options" : {
    "rootpath" : ""
  },
  "util" : {}
};


// window["breadboardView"].connectionMade = function(component, location) {
//   console.log('Received: connect, component|' + component + '|' + location);
// };

// window["breadboardView"].connectionBroken = function(component, location) {
//   console.log('Received: disconnect, component|' + component + '|' + location);
// };

// window["breadboardView"].probeAdded = function(meter, color, location) {
//   console.log('Received: connect, ' + meter + '|probe|' + color + '|' + location);
// };

// window["breadboardView"].probeRemoved = function(meter, color) {
//   console.log('Received: disconnect, ' + meter + '|probe|' + color);
// };

// window["breadboardView"].dmmDialMoved = function(value) {
//   console.log('Received: multimeter_dial >> ' + value);
// };

/**
 * breadboardView # util # require
 * >> loading required resources
 **/

(function($, board) {

  board.util.require = function(files, callback) {
    return new LoadingStack(files, callback).load();
  };

  var LoadingStack = function(files, callback) {
    // callback function
    this.callback = callback;
    // downloaded resources
    this.resources = {};
    // main stack of loading files
    this.stack = files;
    // counter of loaded files
    this.loaded = 0;
  };

  LoadingStack.prototype.success = function() {
    if (++this.loaded == this.stack.length) {
      this.callback(this.resources);
    }
  };

  LoadingStack.prototype.attachData = function(file, data) {
    file = file.substring(file.lastIndexOf('\/') + 1, file.lastIndexOf('.'));
    this.resources[file] = data;
  };

  LoadingStack.prototype.load = function() {
    var f;
    for (var i = this.stack.length; i--; ) {
      f = this.stack[i];
      this["load" + f.toUpperCase().substring( f.lastIndexOf('.') + 1 )](f);
    }
  };

  LoadingStack.prototype.loadJS = function(file) {
    file = board.options.rootpath + file;

    $.getScript(file, function(stack) {
      return function() {
        stack.success();
      };
    }(this)).fail(function() {
      console.log("# [error] (while requiring) failed load/compile javascript file: " + file);
    });
  };

  LoadingStack.prototype.loadCSS = function(file) {
    file = board.options.rootpath + file;

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = file;
    document.head.appendChild(link);

    this.success();
  };

  LoadingStack.prototype.loadSVG = function(file) {
    this.loadResource(file);
  };

  LoadingStack.prototype.loadResource = function(file) {
    file = board.options.rootpath + file;

    $.ajax({
      "url" : file,
      "type" : "GET",
      "dataType" : "html",
      "success" : function(stack) {
        return function(data) {
          stack.attachData(file, data);
          stack.success();
        };
      }(this),
      "error" : function() {
        console.log("# [error] (while requiring) failed load resource file: " + file);
      }
    });
  };

})(jQuery, window["breadboardView"]);

/**
 * breadboardView # board
 * >> create board object with API
 **/

(function($, board) {

  // global link to common SVG-jQuery object
  var paper = null;

  // global event model
  var touch = !!('ontouchstart' in document.documentElement);

  var _mousedown = (touch ) ? 'touchstart' : 'mousedown';
  var _mousemove = (touch ) ? 'touchmove' : 'mousemove';
  var _mouseup = (touch ) ? 'touchend' : 'mouseup';
  var _mouseover = (touch ) ? 'xxx' : 'mouseover';
  var _mouseout = (touch ) ? 'xxx' : 'mouseout';

  // object contains electronic and test equipment
  var equipment = function() {
  };
  // object contains components added to breadboard
  var component = function() {
  };
  // parts of more complex components on breadboard(need only for building)
  var primitive = function() {
  };
  // board constructor
  var CircuitBoard = function(id) {
    var self = this;
    // link to main holder
    this.holder = $('#' + id).html('').append(
      SVGStorage.create('board')
    ).addClass('circuit-board');

    this.workspace = this.holder.find("[item=components]");
    this.holes = {
      'row' : {}
    };
    // model of links to components by id and as the array
    this.component = {};
    this.itemslist = [];

    // create model of holes
    var p = SVGStorage.point(), bbox, matrix, elem, name;
    this.holder.find("[hole]").first().each(function() {
      bbox = this.getBBox();
      p.x = bbox.x + bbox.width / 2;
      p.y = bbox.y + bbox.height / 2;
    }).end().each(function() {
      matrix = this.getCTM();
      elem = $(this), name = elem.attr("hole");
      elem = new CircuitBoardHole(elem);
      elem.center = p.matrixTransform(matrix);
      if (!self.holes.row[elem.y]) {
        self.holes.row[elem.y] = {};
      }
      self.holes.row[elem.y][elem.x] = elem;
      self.holes[name] = elem;
    });
    this.holes.find = findNearestHole;

    // multimeter (DMM)
    this.multimeter = null;
    // battery
    this.battery = null;

    // init all leads draggable
    primitive.prototype.initLeadDraggable(this);
    // init all probes draggable
    primitive.prototype.initProbeDraggable(this);
    // init all components draggable
    primitive.prototype.initComponentDraggable(this);
  };

  CircuitBoard.prototype.sendEventToModel = function(evName, params) {
    if (sparks && sparks.breadboardComm) {
      sparks.breadboardComm[evName](params[0], params[1], params[2]);
    }
  };

  CircuitBoard.prototype.addComponent = function(elem) {
    this.component[elem["UID"]] = new component[ elem["type"] ](elem, this.holes, this);
    this.component[elem["UID"]]["type"] = elem["type"];
    this.component[elem["UID"]]["id"] = elem["UID"];
    this.itemslist.push(this.component[elem["UID"]]);
    this.workspace.append(this.component[elem["UID"]].view);
  };

  CircuitBoard.prototype.removeComponent = function(id) {
    this.component[id].hole[0].disconnected();
    this.component[id].hole[1].disconnected();
    this.component[id].view.remove();
    this.component[id] = null;
    for (var i = this.itemslist.length; i--; ) {
      if (this.itemslist[i].id === id) {
        this.itemslist.splice(i, 1);
      }
    }
  };

  CircuitBoard.prototype.addDMM = function(params) {
    if (!this.multimeter) {
      this.multimeter = new equipment.multimeter(this, params);
    }
    this.multimeter.probe['black'].view.show();
    this.multimeter.probe['red'].view.show();
    this.multimeter.mmbox.view.show();
    this.setDMMText('  0.0 0');
  };

  CircuitBoard.prototype.setDMMText = function(text) {
    if (this.multimeter) {
      for (var i = text.length; i--; ) {
        var val = '#:dmm-digit-' + text.charAt(i);
        this.multimeter.mmbox.screen[i].setAttribute('xlink:href', val);
      }
    }
  };

  CircuitBoard.prototype.removeDMM = function() {
    this.multimeter.probe['black'].view.hide();
    this.multimeter.probe['red'].view.hide();
    this.multimeter.mmbox.view.hide();
  };

  CircuitBoard.prototype.addBattery = function(connections) {
    if (!this.battery) {
      this.battery = new equipment.battery(this, connections);
      this.workspace.append(this.battery.blackWire, this.battery.redWire);
      this.itemslist.push(this.battery);
    }
    this.battery.btbox.view.show();
    this.battery.blackWire.show();
    this.battery.redWire.show();

    this.battery.pts[0].connected();
    this.battery.pts[1].connected();
  };

  CircuitBoard.prototype.removeBattery = function() {
    if (this.battery) {
      this.battery.btbox.view.hide();
      this.battery.blackWire.hide();
      this.battery.redWire.hide();

      this.battery.pts[0].disconnected();
      this.battery.pts[1].disconnected();
    }
  };

  CircuitBoard.prototype.addOScope = function(params) {
    if (!this.oscope) {
      this.oscope = new equipment.oscope(this, params);
    }
    this.oscope.probe['yellow'].view.show();
    this.oscope.probe['pink'].view.show();
  };

  CircuitBoard.prototype.removeOScope = function() {
    this.oscope.probe['yellow'].view.hide();
    this.oscope.probe['pink'].view.hide();
  };

  CircuitBoard.prototype.toFront = function(component) {
    // resolve crash in Google Chrome by changing environment
    var self = this;
    setTimeout(function() {
      var i = component.view.index();
      var redrawId = component.view[0].ownerSVGElement.suspendRedraw(50);
      // use prepend to avoid crash in iOS
      self.workspace.prepend(component.view.parent().children(':gt(' + i + ')'));
      component.view[0].ownerSVGElement.unsuspendRedraw(redrawId);
    }, 50);
  };

  // holes constructor
  var CircuitBoardHole = function(elem) {
    this.name = elem.attr('hole');
    this.x = parseInt(elem.attr("transform").match(/(-?\d+\.\d+)|-?\d+/g)[4], 10);
    this.y = parseInt(elem.attr("transform").match(/(-?\d+\.\d+)|-?\d+/g)[5], 10);
    this.num = (elem.attr("xlink:href") == "#$:hole_connected") ? 1 : 0;
    this.view = elem;
  };

  CircuitBoardHole.prototype.connected = function() {
    this.num++;
    this.view.attr("xlink:href", "#$:hole_connected");
    return this;
  };

  CircuitBoardHole.prototype.disconnected = function() {
    if (--this.num === 0) {
      this.view.attr("xlink:href", "#$:hole_not_connected");
    }
    return this;
  };

  CircuitBoardHole.prototype.highlight = function() {
    this.view.attr("xlink:href", "#$:hole_highlighted");
    return this;
  };

  CircuitBoardHole.prototype.unhighlight = function() {
    var pref = (this.num) ? '' : '_not';
    this.view.attr("xlink:href", "#$:hole" + pref + "_connected");
    return this;
  };
  /* === #equipments begin === */
  equipment.multimeter = function(board, params) {
    this.mmbox = new primitive.mmbox(board, params);
    this.probe = {
      "black" : new primitive.probe(board, {
        'connection' : (params['black']) ? params.black.connection : false,
        'draggable' : (params['black']) ? params.black.draggable : false,
        'color' : 'black',
        'name' : 'dmm'
      }),
      "red" : new primitive.probe(board, {
        'connection' : (params['red']) ? params.red.connection : false,
        'draggable' : (params['red']) ? params.red.draggable : false,
        'color' : 'red',
        'name' : 'dmm'
      })
    };
  };

  equipment.oscope = function(board, params) {
    this.probe = {
      "yellow" : new primitive.probe(board, {
        'connection' : (params['yellow']) ? params.yellow.connection : false,
        'draggable' : (params['yellow']) ? params.yellow.draggable : false,
        'color' : 'yellow',
        'name' : 'oscope'
      }),
      "pink" : new primitive.probe(board, {
        'connection' : (params['pink']) ? params.pink.connection : false,
        'draggable' : (params['pink']) ? params.pink.draggable : false,
        'color' : 'pink',
        'name' : 'oscope'
      })
    };
  };

  equipment.battery = function(board, connections) {
    this.btbox = new primitive.btbox(board);

    var loc = connections.split(',');
    this.pts = [board.holes[loc[0]], board.holes[loc[1]]];

    // create leads

    this.leads = addLeads(this.pts, [300, 45], loc, 'battery', false, board);

    // create wires
    this.wires = [];
    this.wires[0] = new primitive.batteryWireRed(this.pts[1]);
    this.wires[1] = new primitive.batteryWireBlack(this.pts[0]);

    this.blackWire = SVGStorage.create('group').attr({
      'component' : 'batteryWireBlack'
    });

    this.redWire = SVGStorage.create('group').attr({
      'component' : 'batteryWireRed'
    });

    this.blackWire.append(this.wires[0].view, this.leads[0].view);
    this.redWire.append(this.wires[1].view, this.leads[1].view);

  };
  /* === #equipments end === */
  /* === #components begin === */
  component.prototype.init = function(params, holes, board) {
    var loc = params["connections"].split(','), self = this;
    this.pts = [holes[loc[0]], holes[loc[1]]];
    this.angle = getAngleBetwPoints(this.pts);
    this.leads = addLeads(this.pts, getDegsFromRad(this.angle), loc, params.UID, params.draggable, board);
    this.view = SVGStorage.create('group').attr({
      'component' : params.type,
      'uid' : params.UID
    });
    this.hole = [this.pts[0].connected(), this.pts[1].connected()];
  };

  component.wire = function(params, holes, board) {
    component.prototype.init.call(this, params, holes, board);
    var color = params.color || "rgb(173,1,1)";
    this.element = new primitive.connector(this.pts, this.angle, [color, color]);
    this.connector = this.element;
    this.view.append(this.element.view, this.leads[0].view, this.leads[1].view);
    // add event handler for draggable
    component.prototype.drag.call(this, params.draggable, params.type);
  };

  component.inductor = function(params, holes, board) {
    component.prototype.init.call(this, params, holes, board);
    this.connector = new primitive.connector(this.pts, this.angle, ['rgb(108,27,13)', 'rgb(185,77,42)']);
    this.element = new primitive.inductor(this.pts, this.angle, params.label);
    this.view.append(this.connector.view, this.leads[0].view, this.leads[1].view, this.element.view);
    // add event handler for draggable
    component.prototype.drag.call(this, params.draggable);
  };

  component.resistor = function(params, holes, board) {
    component.prototype.init.call(this, params, holes, board);
    this.connector = new primitive.connector(this.pts, this.angle);
    this.element = new primitive.resistor(this.pts, this.angle, params.label, params.color);
    this.view.append(this.leads[0].view, this.leads[1].view, this.connector.view, this.element.view);
    // add event handler for draggable
    component.prototype.drag.call(this, params.draggable);
  };

  component.capacitor = function(params, holes, board) {
    component.prototype.init.call(this, params, holes, board);
    var color = params.color || "rgb(255,0,0)";
    this.connector = new primitive.connector(this.pts, this.angle);
    this.element = new primitive.capacitor(this.pts, this.angle, params.label, color);
    this.view.append(this.leads[0].view, this.leads[1].view, this.connector.view, this.element.view);
    // add event handler for draggable
    component.prototype.drag.call(this, params.draggable);
  };

  component.prototype.drag = function(draggable, type) {
    if (draggable) {
      var self = this;
      this.x = 0;
      this.y = 0;
      if (type == 'wire') {
        this.view.find('[drag=area]').attr('display', 'inline');
      }
      this.element.view[0].addEventListener(_mousedown, function(evt) {
        self.element.view.data('component', self);
        evt._target = this;
      }, false);
    }
  };
  /* === #components end === */
  /* === #primitive begin === */
  primitive.prototype.initComponentDraggable = function(board) {
    var component, s_pos, c_pos, x = 0, y = 0, coeff = 25, i, dx, dy;
    var l1, l2, ho1, ho2, hn1, hn2, begDiffX, c, deg, angle;
    var hi1, hi2;
    var p1 = {
      x : 0,
      y : 0
    }, p2 = {
      x : 0,
      y : 0
    }, pts = [p2, p1];

    board.holder[0].addEventListener(_mousedown, function(evt) {
      component = $(evt._target).data('component') || null;
      if (component) {
        s_pos = getCoords(evt, board.holder);

        l1 = component.leads[0];
        l2 = component.leads[1];

        p1.x = l1.x;
        p1.y = l1.y;
        p2.x = l2.x;
        p2.y = l2.y;

        ho1 = component.hole[0].highlight();
        ho2 = component.hole[1].highlight();
        hi1 = hn1 = ho1;
        hi2 = hn2 = ho2;

        board.toFront(component);
        evt.preventDefault();
      }
      //
    }, false);

    board.holder[0].addEventListener(_mousemove, function(evt) {
      if (component) {
        c_pos = getCoords(evt, board.holder);
        dx = c_pos.x - s_pos.x;
        dy = c_pos.y - s_pos.y;
        x = component.x + dx * coeff;
        y = component.y + dy * coeff;
        // update view of component
        component.view.attr('transform', 'translate(' + x + ',' + y + ')');
        // highlight nearest holes
        p1.x = l1.x + dx * coeff;
        p1.y = l1.y + dy * coeff;
        p2.x = l2.x + dx * coeff;
        p2.y = l2.y + dy * coeff;
        hn1 = board.holes.find(p1);
        hn2 = board.holes.find(p2);
        if (hi1 || hi2) {
          hi1.disconnected().highlight();
          hi2.disconnected().highlight();
          hi1 = hi2 = null;
          // sent event to model
          if (l1.state != l1.view_d) {
            l1.board.sendEventToModel("connectionBroken", [l1.name, l1.hole]);
          }
          if (l2.state != l2.view_d) {
            l2.board.sendEventToModel("connectionBroken", [l2.name, l2.hole]);
          }
        }
        if (hn1 != ho1) {
          ho1.unhighlight();
          ho1 = hn1.highlight();
        }
        if (hn2 != ho2) {
          ho2.unhighlight();
          ho2 = hn2.highlight();
        }
      }
    }, false);

    board.holder[0].addEventListener(_mouseup, function(evt) {
      if (component) {
        // snap to nearest holes
        component.hole[0] = hn1;
        component.hole[1] = hn2;
        l1.hole = hn1.name;
        l2.hole = hn2.name;
        component.x = 0;
        component.y = 0;
        // update all primitives
        p1.x = l1.x = hn1.x;
        p1.y = l1.y = hn1.y;
        p2.x = l2.x = hn2.x;
        p2.y = l2.y = hn2.y;
        // update view
        hn1.unhighlight();
        hn2.unhighlight();
        if (!hi1) {
          hn1.connected();
          l1.connect();
        }
        if (!hi2) {
          hn2.connected();
          l2.connect();
        }
        updateComponentView();
        // reset temp variables
        component = null;
        hn1 = null;
        hn2 = null;
      }
    }, false);

    var updateComponentView = function() {
      c = {
        x : (p1.x + p2.x) / 2,
        y : (p1.y + p2.y) / 2
      };
      angle = getDegsFromRad(getAngleBetwPoints(pts));
      deg = (angle > 90 || angle < -90) ? (angle + 180) : angle;
      // update view of primitives
      component.view.removeAttr('transform');
      l1.view.attr('transform', 'translate(' + l1.x + ',' + l1.y + ') rotate(' + angle + ',130,130)');
      l2.view.attr('transform', 'translate(' + l2.x + ',' + l2.y + ') rotate(' + angle + ',130,130)');
      component.element.view.attr('transform', 'translate(' + c.x + ',' + c.y + ') rotate(' + deg + ',132.5,132.5)');
      setConnectorView(component.connector.view, pts, angle);
    };

  };

  primitive.prototype.initLeadDraggable = function(board) {
    var lead_this, lead_pair, component, view, coeff = 25;
    // coeff = 1 / (0.05*0.8)
    var bbox, s_pos, c_pos, x, y, dx, dy, pts, angle, c;
    var p1 = {
      x : 0,
      y : 0
    }, p2 = {
      x : 0,
      y : 0
    }, deg, hi, ho, hn;

    board.holder[0].addEventListener(_mousedown, function(evt) {
      lead_this = $(evt.target).data('primitive-lead') || null;
      if (lead_this) {
        component = board.component[lead_this.name];
        lead_pair = findLeadPair(component, lead_this);
        hi = board.holes.find(lead_this).highlight();
        hn = ho = hi;
        s_pos = getCoords(evt, board.holder);
        p2.x = lead_pair.x;
        p2.y = lead_pair.y;
        pts = (lead_this.orientation == 1) ? [p1, p2] : [p2, p1];
        evt.preventDefault();
      }
    }, false);

    board.holder[0].addEventListener(_mousemove, function(evt) {
      if (lead_this) {
        // calc move params
        c_pos = getCoords(evt, board.holder);
        dx = c_pos.x - s_pos.x;
        dy = c_pos.y - s_pos.y;
        p1.x = lead_this.x + dx * coeff;
        p1.y = lead_this.y + dy * coeff;
        // update view of component
        updateComponentView();
        // update flag for hover events
        lead_this.isDragged = true;
        // find the nearest hole
        hn = board.holes.find(p1);
        if (hi) {
          hi.disconnected().highlight();
          hi = null;
          // sent event to model
          if (lead_this.state != lead_this.view_d) {
            lead_this.board.sendEventToModel("connectionBroken", [lead_this.name, lead_this.hole]);
          }
        }
        if (hn != ho) {
          ho.unhighlight();
          ho = hn.highlight();
        }
      }
    }, false);

    board.holder[0].addEventListener(_mouseup, function(evt) {
      if (lead_this) {
        lead_this.isDragged = false;
        lead_this.x = p1.x = hn.x;
        lead_this.y = p1.y = hn.y;
        lead_this.hole = hn.name;
        component.hole[0] = board.holes[lead_this.hole];
        component.hole[1] = board.holes[lead_pair.hole];
        updateComponentView();
        hn.unhighlight();
        if (!hi) {
          lead_this.connect();
          hn.connected();
        }
        // reset temp links
        hn = null;
        ho = null;
        lead_this = null;
        lead_pair = null;
      }
    }, false);

    var updateComponentView = function() {
      lead_this.arrow.hide();
      c = {
        x : (p1.x + p2.x) / 2,
        y : (p1.y + p2.y) / 2
      };
      angle = getDegsFromRad(getAngleBetwPoints(pts));
      deg = (angle > 90 || angle < -90) ? (angle + 180) : angle;
      // update view of primitives
      lead_this.view.attr('transform', 'translate(' + p1.x + ',' + p1.y + ') rotate(' + angle + ',130,130)');
      lead_pair.view.attr('transform', 'translate(' + p2.x + ',' + p2.y + ') rotate(' + angle + ',130,130)');
      component.element.view.attr('transform', 'translate(' + c.x + ',' + c.y + ') rotate(' + deg + ',132.5,132.5)');
      setConnectorView(component.connector.view, pts, angle);
    };

  };

  primitive.lead = function(type, pos, angle, draggable) {
    var lead = SVGStorage.create('lead').clone(), self = this;
    this.view_d = lead.find('[type="disconnected"]').hide();
    this.view_c = lead.find('[type="connected"]').show();

    // name of component
    this.name = pos.name;
    // name of hole
    this.hole = pos.hole;
    // link to change colors
    this.wire = lead.find('[type="wire"] path');
    // link to current visible lead
    this.state = this.view_c;
    // link to probe;
    this.probe = false;

    // set the right direction
    this.orientation = (type == 'left') ? 1 : -1;
    lead.find('[type="orientation"]').attr({
      "transform" : 'matrix(' + self.orientation + ' 0 0 1 0 0)'
    });

    // set the position
    lead.attr("transform", "matrix(1 0 0 1 " + pos.x + " " + pos.y + ") rotate(" + (180 + angle) + ",130,130)");
    this.x = pos.x;
    this.y = pos.y;

    this.arrow = lead.find('.arrow').hide();
    // bind hover events
    var action = lead.find("[type=action]");
    if (!touch) {
      action.bind('mouseover', function() {
        self.arrow.show();
      });
      action.bind('mouseout', function() {
        self.arrow.hide();
      });
    }
    if (draggable) {
      action.data('primitive-lead', this);
    }

    // bind onclick events
    action[0].addEventListener(_mouseup, function(l) {
      var f = false;
      return function() {
        if (!l.isDragged) {
          l[ (f = !f) ? 'disconnect' : 'connect' ]();
        }
      };
    }(this), false);

    this.view = lead;
  };

  primitive.lead.prototype.connect = function() {
    this.state = this.view_c;
    this.view_d.hide();
    this.view_c.show();
    this.snapProbe();
    this.board.sendEventToModel("connectionMade", [this.name, this.hole]);
  };

  primitive.lead.prototype.disconnect = function() {
    this.state = this.view_d;
    this.view_c.hide();
    this.view_d.show();
    this.snapProbe();
    this.board.sendEventToModel("connectionBroken", [this.name, this.hole]);
  };

  primitive.lead.prototype.highlight = function(m) {
    var colors = {// colors for each path
      '0' : ['51, 51, 51', '160,160,160', '229,229,229'],
      '1' : [' 51, 51,255', '160,160,255', '229,229,255'],
      '2' : ['130,110,150', '240,220,160', '255,255,255']
    };

    for (var i = 3; i--; ) {
      this.wire[i + 0].setAttribute('stroke', 'rgb(' + colors[m][i] + ')');
      this.wire[i + 3].setAttribute('stroke', 'rgb(' + colors[m][i] + ')');
    }
  };

  primitive.lead.prototype.calcbbox = function() {
    var matrix = this.state[0].getCTM();
    var bbox = this.state[0].getBBox();
    var p = [SVGStorage.point(), SVGStorage.point(), SVGStorage.point(), SVGStorage.point()];
    // top left point
    p[0].x = bbox.x;
    p[0].y = bbox.y;
    // top right point
    p[1].x = bbox.x + bbox.width;
    p[1].y = bbox.y;
    // bottom right point
    p[2].x = bbox.x + bbox.width;
    p[2].y = bbox.y + bbox.height;
    // bottom left point
    p[3].x = bbox.x;
    p[3].y = bbox.y + bbox.height;
    // apply matrix transform to all points
    for (var i = p.length; i--; ) {
      p[i] = p[i].matrixTransform(matrix);
    }
    // return result
    this.state.bbox = p;
  };

  primitive.lead.prototype.hasPoint = function(p) {
    var a, b, c, sa, sb, sc;
    a = this.state.bbox[0];
    b = this.state.bbox[2];
    // first triangle
    c = this.state.bbox[1];
    sa = (a.x - p.x) * (b.y - a.y) - (b.x - a.x) * (a.y - p.y);
    sb = (b.x - p.x) * (c.y - b.y) - (c.x - b.x) * (b.y - p.y);
    sc = (c.x - p.x) * (a.y - c.y) - (a.x - c.x) * (c.y - p.y);
    if ((sa >= 0 && sb >= 0 && sc >= 0) || (sa <= 0 && sb <= 0 && sc <= 0)) {
      return true;
    }
    //second triangle
    c = this.state.bbox[3];
    sa = (a.x - p.x) * (b.y - a.y) - (b.x - a.x) * (a.y - p.y);
    sb = (b.x - p.x) * (c.y - b.y) - (c.x - b.x) * (b.y - p.y);
    sc = (c.x - p.x) * (a.y - c.y) - (a.x - c.x) * (c.y - p.y);
    if ((sa >= 0 && sb >= 0 && sc >= 0) || (sa <= 0 && sb <= 0 && sc <= 0)) {
      return true;
    }
    // return false if no
    return false;
  };

  primitive.lead.prototype.snapProbe = function() {
    if (this.probe) {
      this.probe.snap();
    }
  };

  primitive.connector = function(pts, angle, color) {
    var connector = SVGStorage.create('connector').clone();
    angle = getDegsFromRad(angle) + 180;

    setConnectorView(connector, [pts[1], pts[0]], angle);

    if (color !== undefined) {
      connector.find('[type=line]').eq(1).attr('stroke', color[0]);
      connector.find('[type=line]').eq(2).attr('stroke', color[1]);
    }
    this.view = connector;
  };

  primitive.inductor = function(pts, angle, labelText, draggable) {
    var inductor = SVGStorage.create('inductor').clone();
    angle = getDegsFromRad(angle);

    if (angle > 90 || angle < -90) {
      angle += 180;
    }
    inductor.attr('transform', 'matrix(1 0 0 1 ' + parseInt((pts[0].x + pts[1].x) / 2, 10) + ' ' + parseInt((pts[0].y + pts[1].y) / 2, 10) + ') rotate(' + angle + ',132.5,132.5)');

    var label = inductor.find('[type=label]');
    if (!touch) {
      inductor.bind('mouseover', function() {
        label.show();
      });
      inductor.bind('mouseout', function() {
        label.hide();
      });
    } else {
      label.show();
    }
    inductor.find('[type=label_text]').append(labelText);

    this.view = inductor;
  };

  primitive.capacitor = function(pts, angle, labelText, color) {
    var capacitor = SVGStorage.create('capacitor').clone();
    var label = capacitor.find('[type=label]');
    angle = getDegsFromRad(angle);

    if (angle > 90 || angle < -90) {
      angle += 180;
    }
    capacitor.attr('transform', 'matrix(1 0 0 1 ' + parseInt((pts[0].x + pts[1].x) / 2, 10) + ' ' + parseInt((pts[0].y + pts[1].y) / 2, 10) + ') rotate(' + angle + ',132.5,132.5)');

    if (!touch) {
      capacitor.bind('mouseover', function() {
        label.show();
      });
      capacitor.bind('mouseout', function() {
        label.hide();
      });
    } else {
      label.show();
    }
    capacitor.find('[type=label_text]').append(labelText);
    if (color !== undefined) {
      capacitor.find('[type=cap]').eq(0).attr('fill', color);
    }
    this.view = capacitor;
  };

  primitive.resistor = function(pts, angle, labelText, colors) {
    var resistor = SVGStorage.create('resistor' + colors.length + 'band').clone();
    var tooltip = {};
    var label = resistor.find('[type=label]');
    var band = resistor.find('[type^=band]');
    angle = getDegsFromRad(angle);

    if (angle > 90 || angle < -90) {
      angle += 180;
    }
    resistor.attr('transform', 'matrix(1 0 0 1 ' + (parseInt((pts[0].x + pts[1].x) / 2, 10)+120) + ' ' + parseInt((pts[0].y + pts[1].y) / 2, 10) + ') rotate(' + angle + ',132.5,132.5)');

    band.each(function(i) {
      if (i != (colors.length - 1)) {
        $(this).attr('xlink:href', '#:$:band-s-' + colors[i]);
      } else {
        $(this).attr('xlink:href', '#:$:band-b-' + colors[i]);
      }
    });
    if (!touch) {
      resistor.bind('mouseover', function() {
        label.show();
      });
      resistor.bind('mouseout', function() {
        label.hide();
      });

      band.each(function(i) {
        tooltip[$(this).attr('type')] = resistor.find('[tooltip=' + $(this).attr('type') + ']').attr('xlink:href', '#:$:resistor-hint-' + colors[i]);

        $(this).bind('mouseover', function() {
          $(this).attr('transform', 'scale(1.6)');
          tooltip[$(this).attr('type')].show();
        });
        $(this).bind('mouseout', function() {
          $(this).attr('transform', 'scale(1)');
          tooltip[$(this).attr('type')].hide();
        });
      });
    } else {
      label.show();
    }

    resistor.find('[type=label_text]').append(labelText);

    this.view = resistor;
  };

  primitive.prototype.initProbeDraggable = function(board) {
    var active, lead_new, lead_old, lead_init, point;
    var s_pos, c_pos, x, y, dx, dy, coeff = 20;

    board.holder.find('[info=probe]').each(function() {
      this.addEventListener(_mousedown, function(evt) {
        active = $(this).data('primitive-probe') || {};
        if (active.draggable) {
          s_pos = getCoords(evt, board.holder);
          calcLeadsBBox.call(board);
          lead_init = active.lead;
          evt.stopPropagation();
          evt.preventDefault();
          // hack to avoid errors if mousedown+mouseup-mousemove
          x = active.dx;
          y = active.dy;
          dx = dy = 0;
        } else {
          active = null;
        }
      }, false);
    });

    board.holder[0].addEventListener(_mousemove, function(evt) {
      if (active) {
        c_pos = getCoords(evt, board.holder);
        dx = c_pos.x - s_pos.x;
        dy = c_pos.y - s_pos.y;
        //coord for view translations
        x = active.dx + dx * coeff;
        y = active.dy + dy * coeff;
        active.view.attr('transform', 'translate(' + x + ',' + y + ')');
        //coord for real probe coords
        point = {
          'x' : (active.x + dx),
          'y' : (active.y + dy)
        };
        lead_new = findLeadUnderProbe(board, point);
        if (lead_init) {
          board.sendEventToModel("probeRemoved", [active.name, active.color]);
          lead_init = null;
        }
        if (lead_new) {
          lead_new.highlight(1);
          lead_old = lead_new;
          //active.lead = lead_new;
        } else {
          if (lead_old) {
            lead_old.highlight(0);
            lead_old = null;
          }
        }
      }
    }, false);

    board.holder[0].addEventListener(_mouseup, function(evt) {
      if (active) {
        active.x += dx;
        active.y += dy;
        active.dx = x;
        active.dy = y;
        if (lead_new) {
          active.setState(lead_new);
        } else if (active.lead) {
          active.lead = null;
        }
        active = null;
      }
    }, false);
  };

  primitive.probe = function(board, params) {
    // shortcats
    var self = this;
    // temp vars
    var point, coeff = 1.25, lead;

    var elem = board.holder.find('[info=probe][name=' + params.color + ']');
    var initial = elem.find('[type=initial]');

    if (params.connection) {// move to this position
      initial.attr('transform', 'translate(' + (board.holes[params.connection].x / coeff) + ',' + (board.holes[params.connection].y / coeff) + ')');
    }

    // make object
    point = getAttractionPoint(elem);
    this.draggable = params.draggable;
    this.color = params.color;
    this.name = params.name;
    this.x = point.x;
    this.y = point.y;
    this.lead = null;
    this.dx = 0;
    this.dy = 0;
    this.view = elem;
    this.view.show = self.show;
    this.view.hide = self.hide;
    this.view.data('primitive-probe', this);

    if (params.connection) {// snap to lead
      calcLeadsBBox.call(board);
      lead = findLeadUnderProbe(board, {
        'x' : this.x,
        'y' : this.y
      });
      if (lead) {
        this.setState(lead);
      }
    }

    //primitive.prototype.initProbeDraggable(board);
  };

  primitive.probe.prototype.setState = function(lead) {
    this.lead = lead;
    this.lead.probe = this;
    this.lead.highlight(2);
    this.snap();
    lead.board.sendEventToModel("probeAdded", [this.name, this.color, this.lead.hole]);
  };

  primitive.probe.prototype.snap = function() {
    if (this.lead) {
      var p = getAttractionPoint(this.lead.state);
      var coeff = 20;
      var dx = p.x - this.x;
      var dy = p.y - this.y;
      var x = this.dx + dx * coeff;
      var y = this.dy + dy * coeff;
      this.view.attr('transform', 'translate(' + x + ',' + y + ')');
      //coord for real probe coords
      this.x += dx;
      this.y += dy;
      this.dx = x;
      this.dy = y;
    }
  };

  primitive.probe.prototype.show = function() {
    this.css('visibility', 'visible');
  };

  primitive.probe.prototype.hide = function() {
    this.css('visibility', 'hidden');
  };

  primitive.mmbox = function(board, params) {
    this.view = board.holder.find('[info="multimeter"]');
    this.bttn = this.view.find('[info="dmm-bttn"]');
    this.over = this.view.find('[info="dmm-zoom"]');
    this.item = this.view.find('[info="dmm-box"]');
    this.help = this.view.find('[info="zoom-in"]');
    this.board = board;
    this.zoom = 0;
    // 0-normal view, not zoomed, 1-zoomed
    this.state = null;

    this.screen = this.view.find('[type="dmm-screen-digits"]').children('use');

    this.setState(this.model(params.dial || 0));

    var self = this;

    if (!touch) {
      this.view.bind('mouseenter', function() {
        if (!self.zoom) {
          self.help.show();
        }
      });
      this.view.bind('mouseleave', function() {
        self.help.hide();
        //self.zoomOut();
      });
    }

    // hover helps
    this.view.find('.help').each(function() {
      var elem = $(this);
      var usual = elem.find('.usual').show();
      var hover = elem.find('.hover').hide();
      var bttn = elem.find('.event');

      if (!touch) {
        bttn.bind('mouseenter', function() {
          usual.hide();
          hover.show();
        });
        bttn.bind('mouseleave', function() {
          hover.hide();
          usual.show();
        });
      }
    });

    this.view[0].addEventListener(_mousedown, function(evt) {
      if (!self.zoom) {
        self.zoomIn();
      }
      evt.stopPropagation();
      evt.preventDefault();
    }, false);
    board.holder[0].addEventListener(_mousedown, function(evt) {
      if (self.zoom) {
        self.zoomOut();
      }
    }, false);

    // bind events for bttn (tumbler)
    this.point_center = null;
    this.point_calibr = null;
    var tumbler_on = false;

    this.bttn[0].addEventListener(_mousedown, function(evt) {
      self.point_center = getAttractionPoint(self.view, 'point-center');
      self.point_calibr = getAttractionPoint(self.view, 'point-calibr');
      self.rotate(getCoords(evt, board.holder));
      tumbler_on = true;
    }, false);
    this.bttn[0].addEventListener(_mousemove, function(evt) {
      if (tumbler_on) {
        self.rotate(getCoords(evt, board.holder));
      }
    }, false);
    board.holder[0].addEventListener(_mouseup, function(evt) {
      self.point_center = null;
      self.point_calibr = null;
      tumbler_on = false;
    }, false);
  };

  primitive.mmbox.prototype.model = function(v) {
    var n = isNaN(parseInt(v, 10)) ? 1 : 0;
    var k, i, d, md = 360;
    var stack = [[0, 'acv_750'], [17, 'acv_200'], [35, 'p_9v'], [52, 'dca_200mc'], [70, 'dca_2000mc'], [88, 'dca_20m'], [105, 'dca_200m'], [122, 'c_10a'], [140, 'hfe'], [159, 'diode'], [178, 'r_200'], [196, 'r_2000'], [215, 'r_20k'], [233, 'r_200k'], [252, 'r_2000k'], [270, 'dcv_200m'], [288, 'dcv_2000m'], [306, 'dcv_20'], [324, 'dcv_200'], [342, 'dcv_1000']];
    if (!n) {
      v = parseInt(v, 10);
      for ( i = stack.length; i--; ) {
        d = Math.abs(stack[i][n] - v);
        if (d > 180) {
          d = 360 - d;
        }
        if (d < md) {
          md = d;
          k = i;
        }
      }
      v = stack[k][n];
    }
    for ( i = stack.length; i--; ) {
      if (stack[i][n] == v) {
        return stack[i];
      }
    }
  };

  primitive.mmbox.prototype.rotate = function(p) {
    var p1 = {
      'x' : (this.point_calibr.x - this.point_center.x),
      'y' : (this.point_calibr.y - this.point_center.y)
    };
    var p2 = {
      'x' : (p.x - this.point_center.x),
      'y' : (p.y - this.point_center.y)
    };
    var l1 = Math.sqrt(p1.x * p1.x + p1.y * p1.y);
    var l2 = Math.sqrt(p2.x * p2.x + p2.y * p2.y);

    var angle = getDegsFromRad(Math.acos((p1.x * p2.x + p1.y * p2.y) / (l1 * l2)));

    if (p2.x < 0) {
      angle = 360 - angle;
    }

    var model = this.model(angle);

    if (this.state != model[1]) {
      this.setState(model);
    }
  };

  primitive.mmbox.prototype.setState = function(state) {
    this.bttn.attr('transform', 'rotate(' + state[0] + ')');
    this.state = state[1];
    this.board.sendEventToModel("dmmDialMoved", [this.state]);
  };

  primitive.mmbox.prototype.zoomOut = function() {
    this.item.attr('transform', 'scale(0.50)');
    this.over.show();
    this.zoom = 0;
  };

  primitive.mmbox.prototype.zoomIn = function() {
    this.item.attr('transform', 'scale(1.00)');
    this.help.hide();
    this.over.hide();
    this.zoom = 1;
  };

  primitive.btbox = function(board) {
    var self = this;

    this.view = board.holder.find('[info="battery"]');

    this.view[0].addEventListener(_mouseup, function() {
      self.view.attr('transform', 'scale(1.5)');
      if (touch) {
        setTimeout(function() {
          self.view.attr('transform', 'scale(1)');
        }, 3000);
      }
    });
    this.view[0].addEventListener(_mouseout, function() {
      self.view.attr('transform', 'scale(1)');
    });
  };

  primitive.batteryWireRed = function(point) {
    var batteryWireRed = SVGStorage.create('batteryWireRed').clone();
    batteryWireRed.attr('transform', 'matrix(1 0 0 1 ' + point.x + ' ' + point.y + ')');
    this.view = batteryWireRed;
  };

  primitive.batteryWireBlack = function(point) {
    var batteryWireBlack = SVGStorage.create('batteryWireBlack').clone();
    batteryWireBlack.attr('transform', 'matrix(1 0 0 1 ' + point.x + ' ' + point.y + ')');
    this.view = batteryWireBlack;
  };

  /* === #primitive end === */
  /* === #utils start === */
  var addLeads = function(pts, angle, loc, name, drag, board) {
    var leads = ["right", "left"], angles = [];
    angles = ($.isArray(angle)) ? [angle[0], angle[1]] : [angle, angle];

    for (var i = 0; i < leads.length; i++) {
      leads[i] = new primitive.lead(leads[i], {
        x : pts[i].x,
        y : pts[i].y,
        hole : loc[i],
        name : name
      }, angles[i], drag);
      leads[i].board = board;
      leads[i].connect();
    }
    return leads;
  };
  var setConnectorView = function(elem, pts, deg) {
    // calc transforms
    var trn = 'matrix(1 0 0 1 ' + parseInt(pts[0].x, 10) + ' ' + parseInt(pts[0].y, 10) + ') rotate(' + deg + ',130,130)';
    // calc path
    var leadLenght = 560, coeff = 0.6;
    var dx = pts[0].x - pts[1].x, dy = pts[0].y - pts[1].y;
    var l = Math.sqrt(dx * dx + dy * dy) - leadLenght * 2;
    var path = 'M 0 0 h ' + l / coeff;
    if (l > 0) {
      elem.find('[drag=area]').attr('width', l / coeff);
    }
    // set view
    elem.attr('transform', trn);
    elem.find('[type=line]').each(function() {
      this.setAttribute('d', path);
    });
  };
  var calcLeadsBBox = function() {
    for (var i = this.itemslist.length; i--; ) {
      for (var j = this.itemslist[i].leads.length; j--; ) {
        this.itemslist[i].leads[j].calcbbox();
      }
    }
  };
  var findLeadUnderProbe = function(self, point) {
    for (var i = self.itemslist.length; i--; ) {
      for (var j = self.itemslist[i].leads.length; j--; ) {
        var lead = self.itemslist[i].leads[j];
        if (lead.hasPoint(point)) {
          return lead;
        }
      }
    }
    return false;
  };
  var findLeadPair = function(elem, lead) {
    return (elem.leads[0] === lead) ? elem.leads[1] : elem.leads[0];
  };
  var findNearestHole = function(p) {
    p.y = Math.round(p.y / 50) * 50;
    p.x = Math.round(p.x / 50) * 50;
    var yd, yu, xd, xu, x, y;
    yd = yu = p.y, xd = xu = p.x;
    // first, find neares row
    while (true) {
      if (this.row[yd]) {
        y = yd;
        break;
      }
      if (this.row[yu]) {
        y = yu;
        break;
      }
      yd += 50, yu -= 50;
    }
    // second, find nearest cell
    while (true) {
      if (this.row[y][xd]) {
        x = xd;
        break;
      }
      if (this.row[y][xu]) {
        x = xu;
        break;
      }
      xd += 50, xu -= 50;
    }
    // return result
    return this.row[y][x];
  };
  var getAttractionPoint = function(elem, name) {
    name = name || 'attraction';
    var point = elem.find('[type="'+name+'"]')[0];
    var matrix = point.getCTM();
    var bbox = point.getBBox();
    var p = SVGStorage.point();
    p.x = bbox.x + bbox.width / 2;
    p.y = bbox.y + bbox.height / 2;
    return p.matrixTransform(matrix);
  };
  var getAngleBetwPoints = function(pts) {
    return Math.atan2((pts[1].y - pts[0].y), (pts[1].x - pts[0].x));
  };
  var getDegsFromRad = function(rad) {
    return (180 / Math.PI) * rad;
  };
  var getCoords = function(evt, area) {
    evt = evt || window.event;
    var offset = area.offset();

    var posx = 0, posy = 0;

    if (evt.pageX || evt.pageY) {
      posx = evt.pageX;
      posy = evt.pageY;
    } else if (evt.clientX || evt.clientY) {
      posx = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      posy = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    if (evt.changedTouches) {
      posx = evt.changedTouches[0].pageX;
      posy = evt.changedTouches[0].pageY;
    }

    return {
      x : (parseInt(posx, 10) - offset.left),
      y : (parseInt(posy, 10) - offset.top)
    };
  };
  /* === #utils stop === */

  var SVGStorage = function(data) {
    var self = this;
    this.view = {
      'board' : data.filter('svg')
    };
    data.find('[primitive]').each(function() {
      var elem = $(this), name = elem.attr('primitive');
      elem.removeAttr('primitive');
      self.view[name] = elem.remove();
    });
  };

  SVGStorage.prototype.create = function(name) {
    return this.view[name].clone();
  };

  SVGStorage.prototype.point = function() {
    return this.view.board[0].createSVGPoint();
  };

  /* board object */

  // flag, all critical objects built
  var $ready = false;
  // stack of callback functions
  var $stack = [];

  board.util.require(["common/images/sparks.breadboard.svg"], function(data) {
    paper = $(data["sparks.breadboard"]);
    SVGStorage = new SVGStorage(paper);
    $ready = true;
    for (var i = 0, l = $stack.length; i < l; i++) {
      $stack[i]();
    }
  });

  board.create = function(id) {
    return new CircuitBoard(id);
  };

  board.ready = function(callback) {
    if ($ready) {
      callback();
    } else {
      $stack.push(callback);
    }
  };

})(jQuery, window["breadboardView"]);
