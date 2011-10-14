/* FILE qucsator.js */

(function () {
  
  this.sparks.circuit.qucsator = {};
  var q = sparks.circuit.qucsator;
  
  var inGroupsOf = function (ary, n) {
    var grouped = [];
    for(i in ary) {
  //    if (i % 3 == 0) { grouped[Math.floor(i / 3)] = []; }
      if (!grouped[Math.floor(i / 3)]) { grouped[Math.floor(i / 3)] = []; }
      grouped[Math.floor(i / 3)][i % 3] = ary[i];
    }
    return grouped;
  };

  q.qucsate = function (netlist, callback, type) {
    // console.log('netlist=' + q.ppNetlist(netlist));
    // console.log('url=' + sparks.config.qucsate_server_url);
    type = type || 'qucs';
    var data = {};
    data[type || 'qucs'] = netlist;
    $.ajax({
        async: false,
        url: sparks.config.qucsate_server_url,
        data: data,
        success: q.success(callback),
        error: function (request, status, error) {
                  debug('ERROR: url=' + sparks.config.qucsate_server_url + '\nstatus=' + status + '\nerror=' + error);
              }
    });
  };

  //
  // Generate a parser, which is a function that parses the qucs data format
  // and passes the data to the callback
  //
  
  q.success = function(callback) {
    return(function(data) {
      var results = q.parse(data);
      callback(results);
    });
  };

  q.parse = function(data) {
    var results = {};
    // for jsonp we simply put the whole string into the 'result' property of the json object
    if ( data.result ) { data = data.result; }

    var chunks = data.split("\n");
    chunks = inGroupsOf(chunks.slice(1, chunks.length - 1), 3);
    for (var i in chunks) {
      var key = /<indep (.+)\./.exec(chunks[i][0]);
      key = key && key[1];
      if(key) {
        results[key] = parseFloat(chunks[i][1]);
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

        nodes = component.getNodes();
        
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
    if (components["source"] && components["source"].getQucsSimulationType) {
      netlist += "\n" + components["source"].getQucsSimulationType();
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
