describe "Construction of individual circuit components from a JSON circuit specification"
  
  function size(json) {
    var count = 0;
    for (key in json) if (json.hasOwnProperty(key)) count++;
    return count;
  }
  
  function match_prototype_and_object(proto, obj) {
    for (key in proto) {
      if (proto[key] !== obj[key]) return false;
    }
    return true;
  }
    
  
  before_each
    breadModel('clear');
  end
  
  describe "The 'components' array of the Breadboard model, "
    var components, jsonCircuit, component;
    
    before_each
      components = getBreadBoard().components;
    end
        
    describe "given a JSON circuit consisting of only a wire"
      before_each
        jsonCircuit = [{
          type:        "wire",
          UID:         "wire1",
          connections: "a1,b2"
        }];
      end

      describe "before the 'createCircuit' method of breadModel is invoked"
        it "should contain no objects"
          size(components).should.be 0
        end
      end
      
      describe "after the 'createCircuit' method of breadModel is invoked"
        before_each
          breadModel("createCircuit", jsonCircuit);
        end
                
        it "should contain only one object, plus a battery and two leads"
          size(components).should.be 4
        end
        
        describe "the component"
          before_each
            component = components['wire1'];
          end   
            
          it "should be a sparks.circuit.Component"
            match_prototype_and_object(sparks.circuit.Component.prototype, component).should.be true
            component.parentConstructor.should.be_undefined
          end
        end
        
      end // describe after createcircuit is invoked
    end // describe a json circuit w/ only a wire
    
    
    describe "after the 'createCircuit' method of breadModel is invoked with a JSON circuit consisting of a resistor"
      before_each
        jsonCircuit = [{
          type:        "resistor",
          UID:         "R1",
          connections: "a1,b2"
        }];
        breadModel("createCircuit", jsonCircuit);        
      end 
        
      it "should contain one object, plus a battery and two leads"
        size(components).should.be 4
      end
      
      describe "the component"
        before_each
          component = components['R1'];
        end
        
        it "should be a sparks.circuit.Resistor"
          match_prototype_and_object(sparks.circuit.Resistor.prototype, component).should.be true
        end
      end
    end
    
    
    describe "after the 'createCircuit' method of breadModel is invoked with a JSON circuit consisting of an inductor with inductance 1.23H"
      before_each
        jsonCircuit = [{
          type:        "inductor",
          UID:         "L1",
          inductance:  1.23,
          connections: "a1,b2"
        }];
        breadModel("createCircuit", jsonCircuit);        
      end 
      
      describe "the new component"
        before_each
          component = components['L1']
        end
      
        it "should be a sparks.circuit.Inductor"
          match_prototype_and_object(sparks.circuit.Inductor.prototype, component).should.be true
        end
        
        it "should have the specified inductance (1.23 H)"
          component.getInductance().should.be 1.23
        end
      end
    end
    
    
    describe "after the 'createCircuit' method of breadModel is invoked with a JSON circuit consisting of an capacitor with capacitance 2.34F"
      before_each
        jsonCircuit = [{
          type:        "capacitor",
          UID:         "C1",
          capacitance: 2.34,
          connections: "a1,b2"
        }];
        breadModel("createCircuit", jsonCircuit);        
      end 
      
      describe "the new component"
        before_each
          component = components['C1']
        end
      
        it "should be a sparks.circuit.Capacitor"
          match_prototype_and_object(sparks.circuit.Capacitor.prototype, component).should.be true
        end
        
        it "should have the specified capacitance (2.34 F)"
          component.getCapacitance().should.be 2.34       
        end
      end
    end
      
    
  end // describe components array
end // describe construction of circuits...
