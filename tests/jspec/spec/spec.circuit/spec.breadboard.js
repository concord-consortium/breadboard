describe 'Creating a breadboard'
    before
      sparks.config.qucsate_server_url = "http://localhost:1234/sparks/qucsator/solve";
    end
    
    before_each
      breadModel('clear');
    end
    
        
    describe "Adding resistors"
    
      it "should correctly add resistors with colors"
    
        // we can add a 100 ohm resistor
        breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
        var board = getBreadBoard();
        var netlist = sparks.circuit.qucsator.makeNetlist(board);
        netlist.search(/R:resistor.* L1 L2 R=\"100 Ohm\"/).should.be_at_least 0
      
        // we can add a 4200 ohm resistor
        breadModel('insertComponent', 'resistor', {"connections": 'b2,b3', "colors": 'yellow,red,red,gold'});
        netlist = sparks.circuit.qucsator.makeNetlist(board);
        netlist.search(/R:resistor.* L2 L3 R=\"4200 Ohm\"/).should.be_at_least 0
      end 
      
      it "should correctly add resistors with a different rated resistance"
    
        // we can add a 100 ohm resistor
        breadModel('insertComponent', 'resistor', {"UID": 'r1', "connections": 'a1,a2', "resistance": '100', "nominalResistance": '200'});
        var board = getBreadBoard();
        board.components['r1'].resistance.should.be 100
        board.components['r1'].nominalResistance.should.be 200
      end
    
      it "should be able to add a random resistor"
    
        // we can add a random resistor
        breadModel('insertComponent', 'resistor', {"connections": 'a1,a6', "UID": "r1"});
        var board = getBreadBoard();
        var res = board.components.r1;
        var netlist = sparks.circuit.qucsator.makeNetlist(board);
        var regexp = new RegExp("R:r1 L1 L6 R=\""+res.resistance+" Ohm\"");
        netlist.search(regexp).should.be_at_least 0
      end
      
      it "should be able to add an open resistor"
    
        breadModel('insertComponent', 'resistor', {"connections": 'a1,a6', "UID": "r1", "open": true});
        var board = getBreadBoard();
        var res = board.components.r1;
        res.resistance.should.be 1e20
      end
      
      it "should be able to add an shorted resistor"
    
        breadModel('insertComponent', 'resistor', {"connections": 'a1,a6', "UID": "r1", "shorted": true});
        var board = getBreadBoard();
        var res = board.components.r1;
        res.resistance.should.be 1e-6
      end
    
    end
    
    describe "Adding batteries"
    
      it "should be able to add a simple battery"
    
        breadModel('insertComponent', 'battery', {"UID": 'bat', "voltage": 6});
        var board = getBreadBoard();
        board.components.bat.should_not.be null
        board.components.bat.voltage.should.be 6
      end 
      
      it "should be able to add a battery with a range of voltages"
    
        breadModel('insertComponent', 'battery', {"UID": 'bat', "voltage": [8.5, 9]});
        
        var board = getBreadBoard();
        board.components.bat.should_not.be null
        board.components.bat.voltage.should.be_at_least 8.5
        board.components.bat.voltage.should.be_at_most 9
      end
      
      it "should be able to define a range of voltages, and the average voltage should be in the middle"
    
        // we start by adding several batteries, so that we can average their voltages
        breadModel('insertComponent', 'battery', {"voltage": [8.5, 9]});
        breadModel('insertComponent', 'battery', {"voltage": [8.5, 9]});
        breadModel('insertComponent', 'battery', {"voltage": [8.5, 9]});
        breadModel('insertComponent', 'battery', {"voltage": [8.5, 9]});
        breadModel('insertComponent', 'battery', {"voltage": [8.5, 9]});
        breadModel('insertComponent', 'battery', {"voltage": [8.5, 9]});
        
        var components = getBreadBoard().components;
        var sum = 0;
        $.each(components, function(i, component){
          sum += components[i].voltage;
        });
        var average = sum / 6;
        average.should.be_at_least 8.55
        average.should.be_at_most 8.95
      end
    
    end
    
    describe "Mapping ghost holes"
    
      it 'should be able to add a component with a ghost hole'
        breadModel('insertComponent', 'resistor', {"connections": 'a1,xx', "colors": "brown,black,brown,gold"});
        var board = getBreadBoard();
        var netlist = sparks.circuit.qucsator.makeNetlist(board);
        netlist.search(/R:resistor.* L1 xx R="100 Ohm/).should.be_at_least 0
      end
    
      it 'should be able to get holes from breadboard'
    
        // board holes should be mapped to strip
        var a1Hole = getBreadBoard().getHole('a1');
        a1Hole.nodeName().should.be 'L1'
      
        // board holes in a strip should be the same node
        var b1Hole = getBreadBoard().getHole('a1');
        b1Hole.should.be a1Hole
      
        // should be able to get a hole by passing in a hole instead of a string
        var A1Hole = getBreadBoard().getHole(a1Hole);
        A1Hole.should.be a1Hole
      
        // should be able to make ghost holes
        var xHole = getBreadBoard().getHole('x');
        xHole.nodeName().should.be 'x'
      
        // should be able to map holes to ghost holes
        breadModel('mapHole', 'a2', 'y');
        var a2Hole = getBreadBoard().getHole('a2');
        a2Hole.nodeName().should.be 'y'
      end
    
      it 'should be able to map and unmap hole to a ghost hole'
      
        // breadModel('insert', 'resistor', 'a1,yy', 'brown,black,brown,gold');
        breadModel('mapHole', "a4", "yy");
        breadModel('insertComponent', 'wire', {"connections": 'a4,a6'});
      
        var board = getBreadBoard();
        var netlist = sparks.circuit.qucsator.makeNetlist(board);
      
        breadModel('clear');
        breadModel('unmapHole', "a4");
        breadModel('insertComponent', 'wire', {"connections": 'a4,a6'});
      
        var netlist = sparks.circuit.qucsator.makeNetlist(board);
        netlist.search(/TLIN:wire.* L4 L6/).should.be_at_least 0
      end
    
      it 'should be able to unmap a ghost hole when breadboard clears'
      
        // breadModel('insert', 'resistor', 'a1,yy', 'brown,black,brown,gold');
        breadModel('mapHole', "a4", "yy");
        breadModel('insertComponent', 'wire', {"connections": 'a4,a6'});
      
        var board = getBreadBoard();
        var netlist = sparks.circuit.qucsator.makeNetlist(board);
        breadModel('clear');
        breadModel('insertComponent', 'wire', {"connections": 'a4,a6'});
      
        var netlist = sparks.circuit.qucsator.makeNetlist(board);
        netlist.search(/TLIN:wire.* L4 L6/).should.be_at_least 0
      end
    
      it 'should be able to map and unmap existing connections'
      
        // breadModel('insert', 'resistor', 'a1,yy', 'brown,black,brown,gold');
        breadModel('insertComponent', 'wire', {"connections": 'a4,a6'});
      
        breadModel('mapHole', "a4", "yy");
      
        var board = getBreadBoard();
        var netlist = sparks.circuit.qucsator.makeNetlist(board);
        netlist.search(/TLIN:wire.* yy L6/).should.be_at_least 0
      
        breadModel('unmapHole', "a4");
      
        var netlist = sparks.circuit.qucsator.makeNetlist(board);
        netlist.search(/TLIN:wire.* L4 L6/).should.be_at_least 0
      end
    
    end
    
end
