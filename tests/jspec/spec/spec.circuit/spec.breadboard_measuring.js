describe 'Measuring breadboard components with QUCS'
    before
      sparks.config.qucsate_server_url = "http://localhost:1234/sparks/qucsator/solve";
      breadModel('clear');
    end
    
    before_each
       breadModel('clear');
    end
    
    it "should correctly measure resistance"
    
      // we add a 100 ohm resistor
      breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
      var result = breadModel('query', 'resistance', 'a1,a2')
      result.should.be 100
      
      // we add another 100 ohm resistor in series
      breadModel('insertComponent', 'resistor', {"connections": 'b2,b3', "colors": 'brown,black,brown,gold'});
      var result = breadModel('query', 'resistance', 'a1,a3')
      result.should.be 200
      
      // we add a 300 ohm resistor in series, but only measure between 2 and 3
      breadModel('insertComponent', 'resistor', {"connections": 'c3,c4', "colors": 'orange,black,brown,gold'});
      var result = breadModel('query', 'resistance', 'a2,d4')
      result.should.be 400
      
      // we add a 500 ohm resistor in parallel to everything
      // ____100___100___300____
      //   \_____500________/
      breadModel('insertComponent', 'resistor', {"connections": 'd1,d4', "colors": 'green,black,brown,gold'});
      var result = breadModel('query', 'resistance', 'a1,d4')
      result.should.be 250
    end
    
    it "should correctly measure voltage"
      
      // we add a 100 ohm resistor and a 5V battery
      breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
      breadModel('insertComponent', 'battery', {"connections": 'a2,a1', "voltage": 5});
      
      var result = breadModel('query', 'voltage', 'a1,a2')
      result.should.be 5
      
      breadModel('clear');
      
      // we add a 100 ohm resistor and 400 ohm resistor and a 5V battery
      breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
      breadModel('insertComponent', 'resistor', {"connections": 'a2,a3', "colors": 'yellow,black,brown,gold'});
      breadModel('insertComponent', 'battery', {"connections": 'a3,a1', "voltage": 5});
      
      var result = breadModel('query', 'voltage', 'a1,a2')
      result.should.be 1
      var result = breadModel('query', 'voltage', 'a2,a3')
      result.should.be 4
      
      breadModel('clear');
      
      // we add a 100 ohm resistor and 800 ohm resistor to 9V rails
      breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
      breadModel('insertComponent', 'resistor', {"connections": 'a2,a3', "colors": 'gray,black,brown,gold'});
      breadModel('insertComponent', 'wire', {"connections": 'a1,left_positive1'});
      breadModel('insertComponent', 'wire', {"connections": 'a3,left_negative1'});
      
      var result = breadModel('query', 'voltage', 'a2,a1')
      result.should.be 1
      var result = breadModel('query', 'voltage', 'a3,a2')
      result.should.be 8
    end
    
    // previously, this circuit would show a positive voltage in the voltmeter, because
    // we weren't simulating a resistance in parallel with the voltmeter:
    //
    //     +9 ___________      __R2__
    //              |   |__V__|
    //            R1
    //     0 _____|
    it "should correctly measure voltage even with a disconnected resistor"
      
      // we add a 100 ohm resistor and a 9V battery
      breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
      breadModel('insertComponent', 'resistor', {"connections": 'a3,a4', "colors": 'brown,black,brown,gold'});
      breadModel('insertComponent', 'battery', {"connections": 'a2,a1', "voltage": 9});
      
      var result = breadModel('query', 'voltage', 'a1,a3')
      result.should.be 0
    end
    
    
    it "should correctly measure current"
      
      // we add a 100 ohm resistor and a 5V battery
      breadModel('insertComponent', 'resistor', {"connections": 'a1,a2', "colors": 'brown,black,brown,gold'});
      breadModel('insertComponent', 'battery', {"connections": 'a3,a1', "voltage": 5});
      var result = breadModel('query', 'current', 'a2,a3');
      result.should.be (5 / 100)
    end
    
 
    
end