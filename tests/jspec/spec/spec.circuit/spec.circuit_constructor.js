describe 'Circuit Constructor'

  before_each
    breadModel('clear');
    
    function size(json){
      var count = 0;
      for(obj in json) count++;
      return count;
    }
  end
  
  describe "Creating basic circuits"

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
  end
  
  describe "Creating resistors"
   
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
        while (num < 1 || num >= 100){
          num = (num < 1) ? num*10 : num/10;
        }
        return num;
      }
    
      var validResistance5perc = [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 
                                  30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91]
      var validResistance10perc = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82]
                                
      var resistors = ['r1','r2','r3','r4'];
      for (i in resistors){
        var resistor = components[resistors[i]];
        if (resistor.tolerance == 0.05){
          contains(validResistance5perc, getTen(resistor.nominalResistance)).should.be true
        } else {
          contains(validResistance10perc, getTen(resistor.nominalResistance)).should.be true
        }
      }
    
    end
  
    it 'random nominal resistances should always be within one order of magnitude'
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
        }
      ];
      breadModel("createCircuit", jsonCircuit);

      var components = getBreadBoard().components;
    
      function orderOfMagnitude(num){
        var om = 0;
        while (num >= 100){
          num = num / 10;
          om++;
        }
        return om;
      }
                                
      var resistors = ['r1','r2','r3','r4'];
      var lowestOM = 10;
      for (i in resistors){
        var resistor = components[resistors[i]];
        var om = orderOfMagnitude(resistor.nominalResistance);
        if (om < lowestOM){
          lowestOM = om;
        }
      }
    
      for (i in resistors){
        var resistor = components[resistors[i]];
        var om = orderOfMagnitude(resistor.nominalResistance);
        om.should.be_greater_than lowestOM - 1
        om.should.be_less_than lowestOM + 2
      }
    
    end
  
    it 'should not create two resistor with the same resistance'
  
      var jsonCircuit = [];
      // add 30 resistors
      for (var i = 0; i < 30; i++){
        jsonCircuit.push({"type": "resistor"});
      }
      breadModel("createCircuit", jsonCircuit);

      var components = getBreadBoard().components;
    
      var resistances = [];
      for (var i in components){
        var resistor  = components[i];
        var resistance = resistor.nominalResistance;
        resistances.push(resistance);
      }
    
      resistances.length.should.be 30
    
      function removeDupes(a)
      {
         var r = new Array();
         o:for(var i = 0, n = a.length; i < n; i++) {
            for(var x = i + 1 ; x < n; x++)
            {
               if(a[x]==a[i]) continue o;
            }
            r[r.length] = a[i];
         }
         return r;
      }
    
      resistances = removeDupes(resistances);                  
      resistances.length.should.be 30
    
    end
  end
  
  describe "Creating faults in the circuit"
  
    it 'should be able to create resistors with simple faults'
      var jsonCircuit = [
        {
          "type": "resistor",
          "UID": "r1",
          "connections": "c3,b4",
          "open": true
        },
        {
          "type": "resistor",
          "UID": "r2",
          "connections": "c4,b5",
          "closed": true
        }
      ];
      breadModel("createCircuit", jsonCircuit);

      var components = getBreadBoard().components;
  
      components['r1'].resistance.should.be 1e20
      components['r2'].resistance.should.be 1e-6
  
    end
  
    it 'should be able to author faults using faults json object'
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
        }
      ];
      breadModel("createCircuit", jsonCircuit);
      
      faults = [
        {
          "type": "open",
          "component": "r1"
        },
        {
          "type": "closed",
          "component": "r2"
        }
      ];
      breadModel("addFaults", faults);

      var components = getBreadBoard().components;
  
      components['r1'].resistance.should.be 1e20
      components['r2'].resistance.should.be 1e-6
  
    end
    
    it 'should be able to author a fault on a random component'
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
        }
      ];
      breadModel("createCircuit", jsonCircuit);
      
      faults = [
        {
          "type": "open",
          "count": 1
        }
      ];
      breadModel("addFaults", faults);

      var components = getBreadBoard().components;
      
      var oneResIsOpen = false;
      if ((components['r1'].resistance === 1e20 && components['r2'].resistance < 1e9) ||
            (components['r1'].resistance < 1e9 && components['r2'].resistance === 1e20)) {
        oneResIsOpen = true;
      }
      oneResIsOpen.should.be true
  
    end
    
    it 'should be able to author a fault on a random number of components'
      var jsonCircuit = [];
      // add 30 resistors
      for (var i = 0; i < 30; i++){
        jsonCircuit.push({"type": "resistor"});
      }
      breadModel("createCircuit", jsonCircuit);
      
      faults = [
        {
          "type": "closed",
          "max": 25
        }
      ];
      breadModel("addFaults", faults);

      var components = getBreadBoard().components;
      
      var numClosed = 0;
      $.each(components, function(i, component){
        if (component.resistance === 1e-6){
          numClosed++;
        }
      });
      
      numClosed.should.be_greater_than 0
      numClosed.should.be_less_than 26
  
    end
    
    it 'should be able to author a random fault on a random component'
      var jsonCircuit = [];
      // add 30 resistors
      for (var i = 0; i < 30; i++){
        jsonCircuit.push({"type": "resistor"});
      }
      breadModel("createCircuit", jsonCircuit);
      
      faults = [
        {
          "type": ["open", "closed"],
          "count": 25
        }
      ];
      breadModel("addFaults", faults);

      var components = getBreadBoard().components;
      
      var numOpen = 0;
      var numClosed = 0;
      $.each(components, function(i, component){
        if (component.resistance === 1e-6){
          numClosed++;
        } else if (component.resistance === 1e20){
          numOpen++;
        }
      });
      
      // very small statistical chance that one of these might be zero
      numOpen.should.be_greater_than 0
      numClosed.should.be_greater_than 0
      
      var total = numOpen + numClosed;
      total.should.be 25
      
  
    end
  
  end
    
    
end
