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
   
   it 'should be able to make a circuit with multiple unnamed resistors'
     var jsonCircuit = [
         {
           "type": "resistor",
           "connections": "b23,b17"
         },
         {
           "type": "resistor",
           "connections": "c17,c11"
         },
         {
           "type": "resistor",
           "connections": "d11,d5"
         }
      ];
     
     breadModel("createCircuit", jsonCircuit);
     
     var components = getBreadBoard().components;
     
     size(components).should.be 3
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
  
  it 'should be able to create a resistor which is a Resistor object'
    var jsonCircuit = [
      {
        "type": "resistor",
        "UID": "r1",
        "connections": "c3,b4"
      }
    ];
    breadModel("createCircuit", jsonCircuit);

    var components = getBreadBoard().components;

    // is a Component
    components['r1'].move.should.not.be undefined
    // is a Resistor
    components['r1'].getNumBands.should.not.be undefined
  end
  
  it 'random nominal resistances should always be valid'
    var jsonCircuit = [
      {
        "type": "resistor",
        "UID": "r1",
        "connections": "c3,b4"
      },
      {
        "type": "resistor",
        "UID": "r2",
        "connections": "c4,b5"
      },
      {
        "type": "resistor",
        "UID": "r3",
        "connections": "c5,b6"
      },
      {
        "type": "resistor",
        "UID": "r4",
        "connections": "c6,b7"
      },
    ];
    breadModel("createCircuit", jsonCircuit);

    var components = getBreadBoard().components;
    
    function contains(array, obj){
      for (i in array){
        if (array[i] == obj){
          return true;
        }
      }
      return false;
    }
    function getTen(num){
      while (num < 1 && num >= 100){
        num = (num < 1) ? num*10 : num/10;
      }
      return num;
    }
    function getHundred(num){
      while (num < 100 && num >= 1000){
        num = (num < 100) ? num*10 : num/10;
      }
      return num;
    }
    
    var validResistance5perc = [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 
                                30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91]
    var validResistance2perc = [100, 105, 110, 115, 121, 127, 133, 140, 147, 154, 162, 
                                169, 178, 187, 196, 205, 215, 226, 237, 249, 261, 274, 
                                287, 301, 316, 332, 348, 365, 383, 402, 422, 442, 464, 
                                487, 511, 536, 562, 590, 619, 649, 681, 715, 750, 787, 
                                825, 866, 909, 953]
                                
    var resistors = ['r1','r2','r3','r4'];
    for (i in resistors){
      var resistor = components[resistors[i]];
      if (resistor.tolerance == 0.05){
        contains(validResistance5perc, getTen(resistor.nominalResistance)).should.be true
      } else {
        contains(validResistance2perc, getHundred(resistor.nominalResistance)).should.be true
      }
    }
    
  end
    
    
end
