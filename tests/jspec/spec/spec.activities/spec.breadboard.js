describe 'Creating a breadboard'
    before
      sparks.config.qucsate_server_url = "http://localhost:1234/sparks/qucsator/solve";
      getBreadBoard().holeMap = {};
    end

    it "should correctly add components"
      breadModel('clear');
      
      // We can add a wire
      breadModel('insert', 'wire', 'a1,a2', 'w1');
      var board = getBreadBoard();
      var netlist = sparks.circuit.qucsator.makeNetlist(board);
      netlist.search(/TLIN:wire.* L1 L2 Z=\"0 Ohm\" L=\"1 mm\" Alpha=\"0 dB\"/).should.be_at_least 0
       
      // We can add a battery, and the wire won't go away
      breadModel('insert', 'battery', 'b2,b3', '3');
      netlist = sparks.circuit.qucsator.makeNetlist(board);
      netlist.search(/Vdc:battery.* L2 L3 U=\"3 V\"/).should.be_at_least 0   
      netlist.search(/TLIN:wire.* L1 L2 Z=\"0 Ohm\" L=\"1 mm\" Alpha=\"0 dB\"/).should.be_at_least 0    
    end
    
    it "should correctly remove components"
      breadModel('clear');
      
      // We can add a wire
      breadModel('insert', 'wire', 'a1,a2', 'w1');
      var board = getBreadBoard();
      var netlist = sparks.circuit.qucsator.makeNetlist(board);
      netlist.search(/TLIN:wire.* L1 L2 Z=\"0 Ohm\" L=\"1 mm\" Alpha=\"0 dB\"/).should.be_at_least 0
       
      // We can add a battery, and the wire won't go away
      breadModel('insert', 'battery', 'b2,b3', '3');
      netlist = sparks.circuit.qucsator.makeNetlist(board);
      netlist.search(/Vdc:battery.* L2 L3 U=\"3 V\"/).should.be_at_least 0   
      netlist.search(/TLIN:wire.* L1 L2 Z=\"0 Ohm\" L=\"1 mm\" Alpha=\"0 dB\"/).should.be_at_least 0    
      
      // We can remove the wire
      breadModel('remove', 'wire', 'a1,a2');
      netlist = sparks.circuit.qucsator.makeNetlist(board);
      netlist.search(/TLIN:wire.*/).should.be -1
      
      // Removing a battery from wrong location should do nothing
      breadModel('remove', 'battery', 'b2,a2');
      netlist = sparks.circuit.qucsator.makeNetlist(board);
      netlist.search(/Vdc:battery.*/).should.be_at_least 0
    end
    
    it "should correctly add resistors with colors"
      breadModel('clear');
      
      // we can add a 100 ohm resistor
      breadModel('insert', 'resistor', 'a1,a2', 'brown,black,brown,gold');
      var board = getBreadBoard();
      var netlist = sparks.circuit.qucsator.makeNetlist(board);
      netlist.search(/R:resistor.* L1 L2 R=\"100 Ohm\"/).should.be_at_least 0
      
      // we can add a 4200 ohm resistor
      breadModel('insert', 'resistor', 'b2,b3', 'yellow,red,red,gold');
      netlist = sparks.circuit.qucsator.makeNetlist(board);
      netlist.search(/R:resistor.* L2 L3 R=\"4200 Ohm\"/).should.be_at_least 0
    end 
    
    it 'should be able to add a component with a ghost hole'
      breadModel('clear');
      
      breadModel('insert', 'resistor', 'a1,xx', 'brown,black,brown,gold');
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
    
    it 'should be able to map hole to a ghost hole'
      breadModel('clear');
      
      breadModel('insert', 'resistor', 'a1,yy', 'brown,black,brown,gold');
      breadModel('mapHole', "a4", "yy");
      breadModel('insert', 'wire', 'a4,a6');
      
      var board = getBreadBoard();
      var netlist = sparks.circuit.qucsator.makeNetlist(board);
      netlist.search(/TLIN:wire.* yy L6/).should.be_at_least 0
    end
    
    
    
end
