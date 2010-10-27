describe 'Circuit Constructor'

  before_each
    breadModel('clear');
    
    function size(json){
      var count = 0;
      for(obj in json) count++;
      return count;
    }
  end

  it 'should be able to add a component'
  
    var components = getBreadBoard().components;
    size(components).should.be 0
  
    var jsonCircuit = [
      {
        "type": "wire",
        "connections": "a1,b2"
      }
    ];
    
    breadModel("createCircuit", jsonCircuit);
    
    size(components).should.be 1
  end
    
   it 'should be able to add a wire'
     var jsonCircuit = [
       {
         "type": "wire",
         "UID": "newWire",
         "connections": "a1,b2"
       }
     ];
     
     breadModel("createCircuit", jsonCircuit);
     
     var components = getBreadBoard().components;
     
     size(components).should.be 1
   
     $.each(components, function(i, val){
       val.UID.should.be "newWire"
       val.connections[0].nodeName().should.be "L1"
       val.connections[1].nodeName().should.be "L2"
     })
   end
   
   it 'should be able to make a complex circuit'
     var jsonCircuit = [
       {
         "type": "wire",
         "UID": "w1",
         "connections": "a1,b2"
       },
       {
         "type": "resistor",
         "UID": "r1",
         "connections": "c3,b4",
         "resistance": "500"
       },
       {
         "type": "resistor",
         "UID": "r2",
         "connections": "c5,b6",
         "colors": "brown,black,brown,gold",
         "label": "R2"
       },
       {
         "type": "battery",
         "connections": "left_positive1,j10",
         "voltage": "9"
       }
     ];
     
     breadModel("createCircuit", jsonCircuit);
     
     var components = getBreadBoard().components;
     
     size(components).should.be 4
   
     components['w1'].should.not.be null
     components['w1'].kind.should.be "wire"
     components['w1'].connections[0].nodeName().should.be "L1"
     components['w1'].connections[1].nodeName().should.be "L2"
     
     components['r1'].should.not.be null
     components['r1'].kind.should.be "resistor"
     components['r1'].connections[0].nodeName().should.be "L3"
     components['r1'].connections[1].nodeName().should.be "L4"
     components['r1'].resistance.should.be 500
     
     components['r2'].resistance.should.be 100
     
     // check unnamed component
     var batteryExists = false;
     $.each(components, function(i, val){
       if (i.search(/battery.*/) > -1){
         batteryExists = true;
         val.voltage.should.be 9
       }
     });
     batteryExists.should.be true
   end
   
   it 'should be able to create a resistor with random resistances'
      var jsonCircuit = [
        {
          "type": "resistor",
          "UID": "r1",
          "connections": "c3,b4"
        }
      ];

      breadModel("createCircuit", jsonCircuit);

      var components = getBreadBoard().components;

      components['r1'].should.not.be null
      components['r1'].resistance.should.be_at_least 1
    end
end
