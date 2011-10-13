describe "the FunctionGenerator component" 

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


  describe "when put into a circuit as the element with UID 'source'"
  
    var fg;
    
    before_each
      breadModel("createCircuit", [{
        type: "function generator",
        UID:  "source",
        amplitude: 2.5,
        frequencies: [1000]
      }]);
      fg = getBreadBoard().components['source'];
    end

    it "should exist"
      match_prototype_and_object(sparks.circuit.FunctionGenerator.prototype, fg).should.be true
    end
    
    it "should connect the nodes 'powerPosL' and 'gnd'"
      var nodes = fg.getNodes();
      
      nodes[0].should.be "powerPosL"
      nodes[1].should.be "gnd"
    end
    
    describe "its toNetlist method"
    
      it "should correctly specify the function generator"
        fg.toNetlist().should.be 'Vac:source powerPosL gnd U="2.5 V" f="1000" Phase="0" Theta="0"'
      end
      
    end
    
  end
  
  
  describe "its initial 'frequency' property"

    var fg, fgJSON;
  
    before_each
      fgJSON = {
        type: "function generator",
        UID:  "source",
        amplitude: 1
      };
    end
    
    
    describe "when an initialFrequency property is specified"
    
      it "should be equal to the initialFrequency"
        fgJSON.initialFrequency = 2000;
        breadModel('createCircuit', [fgJSON]);
        fg = getBreadBoard().components['source'];
            
        fg.frequency.should.be 2000
      end

    end
      
    describe "when there is no initialFrequency property"
    
      describe "but there is a 'frequencies' property"
        
        describe "which is a list of frequencies" 
        
          it "should be equal to the first frequency"
            fgJSON.frequencies = [1000, 2000]
            breadModel('createCircuit', [fgJSON]);
            fg = getBreadBoard().components['source'];
            
            fg.frequency.should.be 1000
          end
        end
        
        describe "which is a linear-spaced range"
        
          it "should be equal to the start of the range"
            fgJSON.frequencies = ['linear', 1000, 2000];
            breadModel('createCircuit', [fgJSON]);
            fg = getBreadBoard().components['source'];
            
            fg.frequency.should.be 1000
          end
          
        end
        
        describe "which is a log-spaced range"

          it "should be equal to the start of the range"
            fgJSON.frequencies = ['logarithmic', 1000, 2000];
            breadModel('createCircuit', [fgJSON]);
            fg = getBreadBoard().components['source'];
          
            fg.frequency.should.be 1000
          end
           
        end

      end
      
      describe "and there is no 'frequencies' specification"

        it "should throw an error when instantiated"
          (typeof fgJSON.initialFrequency).should.be 'undefined'
          (typeof fgJSON.frequencies).should.be 'undefined'
          
          -{ breadModel('createCircuit', [fgJSON]); }.should.throw_error Error, "FunctionGenerator: initialFrequency is undefined and an initial frequency could not be inferred from frequency range specification."
        end      

      end
      
    end    
  
  end
  
  
  describe "getNetlistSimulationLine()"    
  
    var fg, fgJSON;
  
    before_each
      fgJSON = {
        type: "function generator",
        UID:  "source",
        amplitude: 1
      };
    end
  
    describe "when the frequencies specification is for a linear range"
    
      describe "and the number of range steps is not specified"
        
        it "should return the correct value (an .AC line with Type=\"lin\") and using defaultFrequencySteps)"
          sparks.circuit.FunctionGenerator.prototype.defaultFrequencySteps.should.be 100

          fgJSON.frequencies = ["linear", 1000, 2000];

          breadModel('createCircuit', [fgJSON]);
          fg = getBreadBoard().components['source'];
          
          fg.getNetlistSimulationLine().should.be '.AC:AC1 Type="lin" Start="1000" Stop="2000" Points="100" Noise="no"'          
        end
        
      end
      
      describe "and the number of range steps is specified"

        it "should return the correct value (an .AC line with Type=\"lin\")"
          fgJSON.frequencies = ["linear", 1000, 2000, 3];

          breadModel('createCircuit', [fgJSON]);
          fg = getBreadBoard().components['source'];

          fg.getNetlistSimulationLine().should.be '.AC:AC1 Type="lin" Start="1000" Stop="2000" Points="3" Noise="no"'
        end
      end
    end
  

    describe "when the frequencies specification is for a logarithmic range"

      describe "and the number of range steps is not specified"
        
        it "should return the correct value (an .AC line with Type=\"log\" and using defaultFrequencySteps)"
          sparks.circuit.FunctionGenerator.prototype.defaultFrequencySteps.should.be 100

          fgJSON.frequencies = ["logarithmic", 4000, 5000];

          breadModel('createCircuit', [fgJSON]);
          fg = getBreadBoard().components['source'];
          
          fg.getNetlistSimulationLine().should.be '.AC:AC1 Type="log" Start="4000" Stop="5000" Points="100" Noise="no"'          
        end
        
      end
      
      describe "and the number of range steps is specified"

        it "should return the correct value (an .AC line with Type=\"log\")"
          fgJSON.frequencies = ["logarithmic", 2000, 3000, 4];

          breadModel('createCircuit', [fgJSON]);
          fg = getBreadBoard().components['source'];

          fg.getNetlistSimulationLine().should.be '.AC:AC1 Type="log" Start="2000" Stop="3000" Points="4" Noise="no"'
        end

      end
    
    end
  
  
    describe "when the frequencies specification is a list with more than one element"

      it "should return the correct value (an .AC line with Type=\"list\")"
        fgJSON.frequencies = [2000, 3000, 4000];

        breadModel('createCircuit', [fgJSON]);
        fg = getBreadBoard().components['source'];

        fg.getNetlistSimulationLine().should.be '.AC:AC1 Type="list" Values="[2000; 3000; 4000]" Noise="no"'
      end
      
    end
  
  
    describe "when the frequencies specification is a list with one element"
      it "should return the correct value (an .AC line with Type=\"const\")"
        fgJSON.frequencies = [1234];

        breadModel('createCircuit', [fgJSON]);
        fg = getBreadBoard().components['source'];

        fg.getNetlistSimulationLine().should.be '.AC:AC1 Type="const" Values="1234" Noise="no"'
      end
    end
  
  end
  
end
