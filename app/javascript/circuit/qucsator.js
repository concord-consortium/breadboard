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
        success: q.parser(callback),
        error: function (request, status, error) {
                  debug('ERROR: url=' + sparks.config.qucsate_server_url + '\nstatus=' + status + '\nerror=' + error);
              }
    });
  };

  //
  // Generate a parser, which is a function that parses the qucs data format
  // and passes the data to the callback
  //

  q.parser = function(callback) {
    return(function(data) {
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
      // console.log('qucsate.parser results=' + JSON.stringify(results));
      callback(results);
    });
  };

  //
  // make qucs netlists from breadboard objects
  //
  q.makeNetlist = function(board) {
    var netlist = '# QUCS Netlist\n';
    
    $.each(board.components, function(name, component) {
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
          case "wire":
            line = 'TLIN:' + component.UID + ' ';
            line = line + nodes.join(' ');
            line = line + ' Z="0.000001 Ohm" L="1 mm" Alpha="0 dB"' ;
            break;
          case "battery":
            if ('undefined' === typeof component.voltage || component.voltage === null) { return; }
            line = 'Vdc:' + component.UID + ' ';
            line = line + nodes.join(' ');
            line = line + ' U="' + component.voltage + ' V"' ;
            break;
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

      netlist = netlist + "\n" + line;
    });
    return netlist + "\n.DC:DC1"; 
  };
  
  // Pretty-print netlist
  q.ppNetlist = function (s) {
      return s.replace('\\u000a', '\n');
  };

})();
