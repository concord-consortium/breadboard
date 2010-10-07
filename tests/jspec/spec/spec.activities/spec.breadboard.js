describe 'Creating a breadboard'
    before
      sparks.config.qucsate_server_url = "http://localhost:1234/sparks/qucsator/solve"
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
end
