describe 'Measuring breadboard components with QUCS'
    before
      sparks.config.qucsate_server_url = "http://localhost:1234/sparks/qucsator/solve"
    end
    
    it "should correctly measure resistance"
      breadModel('clear');
      
      // we add a 100 ohm resistor
      breadModel('insert', 'resistor', 'a1,a2', 'brown,black,brown,gold');
      var result = breadModel('query', 'resistance', 'a1,a2')
      result.should.be 100
      
      // we add another 100 ohm resistor in series
      breadModel('insert', 'resistor', 'b2,b3', 'brown,black,brown,gold');
      var result = breadModel('query', 'resistance', 'a1,a3')
      result.should.be 200
      
      // we add a 300 ohm resistor in series, but only measure between 2 and 3
      breadModel('insert', 'resistor', 'c3,c4', 'orange,black,brown,gold');
      var result = breadModel('query', 'resistance', 'a2,d4')
      result.should.be 400
      
      // we add a 500 ohm resistor in parallel to everything
      // ____100___100___300____
      //   \_____500________/
      breadModel('insert', 'resistor', 'd1,d4', 'green,black,brown,gold');
      var result = breadModel('query', 'resistance', 'a1,d4')
      result.should.be 250
    end
    
    it "should correctly measure voltage"
      breadModel('clear');
      
      // we add a 100 ohm resistor and a 5V battery
      breadModel('insert', 'resistor', 'a1,a2', 'brown,black,brown,gold');
      breadModel('insert', 'battery', 'a2,a1', '5');
      var result = breadModel('query', 'voltage', 'a1,a2')
      result.should.be 5
      
      breadModel('clear');
      
      // we add a 100 ohm resistor and 400 ohm resistor and a 5V battery
      breadModel('insert', 'resistor', 'a1,a2', 'brown,black,brown,gold');
      breadModel('insert', 'resistor', 'a2,a3', 'yellow,black,brown,gold');
      breadModel('insert', 'battery', 'a3,a1', '5');
      var result = breadModel('query', 'voltage', 'a1,a2')
      result.should.be 1
      var result = breadModel('query', 'voltage', 'a2,a3')
      result.should.be 4
      
      breadModel('clear');
      
      // we add a 100 ohm resistor and 800 ohm resistor to 9V rails
      breadModel('insert', 'resistor', 'a1,a2', 'brown,black,brown,gold');
      breadModel('insert', 'resistor', 'a2,a3', 'gray,black,brown,gold');
      breadModel('insert', 'wire', 'a1,left_positive_1');
      breadModel('insert', 'wire', 'a3,left_negative_1');
      var result = breadModel('query', 'voltage', 'a2,a1')
      result.should.be 1
      var result = breadModel('query', 'voltage', 'a3,a2')
      result.should.be 8
    end
    
    it "should correctly measure current"
      breadModel('clear');
      
      // we add a 100 ohm resistor and a 5V battery
      breadModel('insert', 'resistor', 'a1,a2', 'brown,black,brown,gold');
      breadModel('insert', 'battery', 'a3,a1', '5');
      var result = breadModel('query', 'current', 'a2,a3');
      result.should.be (5 / 100)
    end
    
 
    
end