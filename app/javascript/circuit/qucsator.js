/* FILE qucsator.js */
/*globals console sparks $ breadModel getBreadBoard debug*/

(function () {
  
  this.sparks.circuit.qucsator = {};
  var q = sparks.circuit.qucsator;
  
  var inGroupsOf = function (ary, n) {
    var grouped = [];
    for(var i in ary) {
  //    if (i % 3 == 0) { grouped[Math.floor(i / 3)] = []; }
      if (!grouped[Math.floor(i / 3)]) { grouped[Math.floor(i / 3)] = []; }
      grouped[Math.floor(i / 3)][i % 3] = ary[i];
    }
    return grouped;
  };
  
  q.previousMeasurements = {};

  q.qucsate = function (netlist, callback, type) {
    
    var key = netlist.replace(/\n/g, '') + type,
        previousMeasurement = this.previousMeasurements[key];
    if (!!previousMeasurement) {
      callback(previousMeasurement);
      return;
    }
    
    type = type || 'qucs';
    var data = {};
    data[type || 'qucs'] = netlist;
    $.ajax({
        async: false,
        url: sparks.config.qucsate_server_url,
        data: data,
        success: function(ret) {
          var results = q.parse(ret);
          q.previousMeasurements[key] = results;
          callback(results);
        },
        error: function (request, status, error) {
          debug('ERROR: url=' + sparks.config.qucsate_server_url + '\nstatus=' + status + '\nerror=' + error);
        }
    });
  };
  
  // This will take the string returned by QUCS and turn in into an object representing the data
  // Each data heading from QUCS, such as source.I, will turn into a (potantially nested) key on
  // the results object, and the value will be an array of the values.
  // Keys may be nested. If a heading is source.I, the array of data will be found at results.source.I.
  // Note that results.source and results.source.I may both be arrays of values.
  q.parse = function(data) {
    var results = {};
    
    // the data may(?) come back as a json object under the key 'result'
    if ( data.result ) { 
      data = data.result; 
    }
    
    // split the data into an array. It will now look something like
    // ["<Qucs Dataset 0.0.15>", "<indep source 2>", "  +1.00000000e+00", "  +5.00000000e+00", "  +9.00000000e+00",
    //   "</indep>", "<dep meter.V V1>", "  +2.00000000e+00", "  +2.00000000e+00", "</dep>"]
    data = data.split("\n");
    
    // iterate through the array of data. If we come across a data heading (<indep...> or <dep...>), create a new
    // key on our results hash. Data under a heading such as "source" will be at results.source, data under a heading
    // such as source.I will be at results.source.I
    // For each value, push that into an array at the current key.
    
    var currentArray = null;
    for (var i = 0, ii = data.length; i < ii; i++) { 
      var line = data[i],
          key,
          dataHeading = /<i?n?dep (.+) /.exec(line); 
          
      if (dataHeading && dataHeading.length) {
        key = dataHeading[1];
         
        if (key.indexOf('.') > 0) { 
          var splitKey = key.split('.'); 
          if (!results[splitKey[0]]) {
            results[splitKey[0]] = [];
          } 
          splitKey[1] = splitKey[1].toLowerCase();      // qucs returns diff cases if in AC or DC mode. We don't want that
          currentArray = results[splitKey[0]][splitKey[1]] = [];
        } else {
          currentArray = results[key] = [];
        } 
        
      } else if (!!currentArray) {
        var val = sparks.ComplexNumber.parse(line);     // Sparks values are always CNs -- in a DC circuit, the i is just ommitted
        if (!!val) {
          currentArray.push(val);
        }
      } 
    }
    

    return results;
  };

  //
  // make qucs netlists from breadboard objects
  //
  q.makeNetlist = function(board) {
    var components = board.components,
        netlist = '# QUCS Netlist\n';
    
    $.each(components, function(name, component) {
      var line;
      
      if ( !component.canInsertIntoNetlist() ) {
        return;
      }
      
      if ( !component.hasValidConnections() ) {
        console.log(component);
        throw new Error("Component " + name + " has invalid connections and cannot be inserted into the netlist");
      }
      
      if ( component.toNetlist ) {
        line = component.toNetlist();
      } else {

        var nodes = component.getNodes();
        
        switch (component.kind) {
          case "vprobe":
            line = 'VProbe:' + component.UID + ' ';
            line = line + nodes.join(' ');
            break;
          case "iprobe":
            line = 'IProbe:' + component.UID + ' ';
            line = line + nodes.join(' ');
            break;
        }
      }

      netlist += "\n" + line;
    });
    
    // get the simulation type from the source power component. If there is no source,
    // assume it's a DC simulation (this should only happen in spec tests when createCircuit
    // was never called)
    if (components.source && components.source.getQucsSimulationType) {
      netlist += "\n" + components.source.getQucsSimulationType();
    } else {
      netlist += "\n" + sparks.circuit.Battery.prototype.getQucsSimulationType();
    }
    
    return netlist;
  };
  
  // Pretty-print netlist
  q.ppNetlist = function (s) {
      return s.replace('\\u000a', '\n');
  };

})();
