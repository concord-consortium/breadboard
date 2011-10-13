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
    
      // we should have 2, because we autmatically add a power source (battery)
      size(components).should.be 2
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
     
       size(components).should.be 2
       
       components["newWire"].should_not.be null
       components["newWire"].connections[0].nodeName().should.be "L1"
       components["newWire"].connections[1].nodeName().should.be "L2"
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
           "UID": "bat",
           "connections": "left_positive1,j10",
           "voltage": "3"
         }
       ];
     
       breadModel("createCircuit", jsonCircuit);
     
       var components = getBreadBoard().components;
     
       size(components).should.be 5
   
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
       
       components['bat'].voltage.should.be 3
     end
  end
  
  describe "Adding power sources"
  
    it "should be able to add a battery power source"
      var jsonCircuit = [
        {
           "type": "battery",
           "UID": "source",
           "voltage": 6
         },
         {
           "type": "wire",
           "UID": "newWire",
           "connections": "a1,b2"
         }
       ];
     
       breadModel("createCircuit", jsonCircuit);
       var components = getBreadBoard().components;
     
       components["source"].should.not.be null
       components["source"].voltage.should.be 6
       components["source"].connections[0].nodeName().should.be "powerPosL"
       components['source'].connections[1].nodeName().should.be "gnd"
    end
    
    it "should add a 9V battery power source if none is specified"
      var jsonCircuit = [
         {
           "type": "wire",
           "UID": "newWire",
           "connections": "a1,b2"
         }
       ];
       
       breadModel("createCircuit", jsonCircuit);
       var components = getBreadBoard().components;

       size(components).should.be 2
       
       components["source"].should.not.be null
       components["source"].voltage.should.be 9
       components["source"].connections[0].nodeName().should.be "powerPosL"
       components['source'].connections[1].nodeName().should.be "gnd"
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
     
       size(components).should.be 4
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
        if (!!components[i].resistance){
          var resistor  = components[i];
          var resistance = resistor.nominalResistance;
          resistances.push(resistance);
        }
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
          "shorted": true
        }
      ];
      breadModel("createCircuit", jsonCircuit);

      var components = getBreadBoard().components;
      
      components['r1'].open.should.be true
      components['r1'].resistance.should.be 1e20
      components['r2'].shorted.should.be true
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
          "type": "shorted",
          "component": "r2"
        }
      ];
      breadModel("addFaults", faults);

      var components = getBreadBoard().components;
      
      components['r1'].open.should.be true
      components['r1'].resistance.should.be 1e20
      components['r2'].shorted.should.be true
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
      if ((components['r1'].open && !components['r2'].open) ||
            (!components['r1'].open && components['r2'].open)) {
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
          "type": "shorted",
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
          "type": ["open", "shorted"],
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
    
    it 'should be able to call getFaults and getFault'
      var jsonCircuit = [
        {
          "type": "resistor",
          "UID": "r1",
          "connections": "c3,b4"
        },
        {
          "type": "resistor",
          "UID": "r2",
          "connections": "c4,b5",
          "open": true
        },
        {
          "type": "resistor",
          "UID": "r3",
          "connections": "c5,b6",
          "shorted": true
        }
      ];
      breadModel("createCircuit", jsonCircuit);

      var faultyComponents = getBreadBoard().getFaults();
      
      faultyComponents.length.should.be 2
      faultyComponents[0].UID.should.be "r2"
      faultyComponents[1].UID.should.be "r3"
      
      var firstFaultyComponent = getBreadBoard().getFault();
      firstFaultyComponent.UID.should.be "r2"
  
    end
  
  end
    
    
end
