describe "Constructing circuits with randomized reactances"

  before_each
    breadModel('clear');
  end

  describe "createCircuit -- handling of referenceFrequency"

    it "should pass the reference frequency to each component's spec"
      var circuit = [{
        "type": "inductor",
        "UID": "L1",
        "connections": "c3,b4",
        "impedance": "500"
      }];
      circuit.referenceFrequency = 1000;
      breadModel("createCircuit", circuit);

      getBreadBoard().components['L1'].referenceFrequency.should.be 1000
    end

    it "should not override the referenceFrequency of a component with a custom reference frequency"
      var circuit = [{
        "type": "inductor",
        "UID": "L1",
        "connections": "c3,b4",
        "referenceFrequency": 5000,
        "impedance": "500"
      }];
      circuit.referenceFrequency = 1000;
      breadModel("createCircuit", circuit);

      getBreadBoard().components['L1'].referenceFrequency.should.be 5000
    end

    it "should not require a referenceFrequency"
      var circuit = [{
        "type": "resistor",
        "UID": "R1",
        "connections": "c3,b4",
        "impedance": "500"
      }];
      breadModel("createCircuit", circuit);

      circuit.referenceFrequency.should.be_undefined
      getBreadBoard().components['R1'].should.not.be_undefined
    end

  end

  describe "handling of impedance specification by insertComponent"

    describe "for a resistor"

      it "should delegate to getRequestedImpedance when the 'resistance' property is defined"
        sparks.circuit.Resistor.prototype.should.receive('getRequestedImpedance');
        breadModel('insertComponent', 'resistor', {"UID": "r1", "resistance": "100"});
      end

      it "should not call getRequestedImpedance when no 'resistance' property is defined"
        sparks.circuit.Resistor.prototype.should.not.receive('getRequestedImpedance');
        breadModel('insertComponent', 'resistor', {"UID": "r1"});
      end
    end

    describe "for an inductor"
      it "should delegate to getRequestedImpedance when the 'impedance' property is defined"
        sparks.circuit.Inductor.prototype.should.receive('getRequestedImpedance');
        breadModel('insertComponent', 'inductor', {"UID": "L1", "impedance": "100", "referenceFrequency": 1000});
      end

      it "should not call getRequestedImpedance when no 'impedance' property is defined"
        sparks.circuit.Inductor.prototype.should.not.receive('getRequestedImpedance');
        breadModel('insertComponent', 'inductor', {"UID": "L1", "referenceFrequency": 1000});
      end
    end

    describe "for an capacitor"
      it "should delegate to getRequestedImpedance when the 'impedance' property is defined"
        sparks.circuit.Capacitor.prototype.should.receive('getRequestedImpedance');
        breadModel('insertComponent', 'capacitor', {"UID": "C1", "impedance": "100", "referenceFrequency": 1000});
      end

      it "should not call getRequestedImpedance when no 'impedance' property is defined"
        sparks.circuit.Capacitor.prototype.should.not.receive('getRequestedImpedance');
        breadModel('insertComponent', 'capacitor', {"UID": "C1", "referenceFrequency": 1000});
      end
    end

  end

  describe "getRequestedImpedance, itself"

    before_each
      getRequestedImpedance = sparks.circuit.Component.prototype.getRequestedImpedance;
    end

    describe "when passed a single, string value"
      it "should return that value"
        getRequestedImpedance("10").should.be "10"
      end
    end

    describe "when passed a single, numeric value"
      it "should return that value"
        getRequestedImpedance(10).should.be 10
      end
    end

    describe "when passed a value of the type ['uniform', <min>, <max>]"

      describe "and not passed a list of magnitude steps"
        it "should return a random numeric value chosen from between min and max, rounded to 3 significant digits"
          stub(Math, 'random').and_return(0.654321)
          getRequestedImpedance(["uniform", 0, 10]).should_be 6.54
        end
      end

      describe "and passed a list of magnitude steps"
        it "should return a value greater than or equal to <min> value, and in the list of steps (scaled to the appropriate order of magnitude)"
          stub(Math, 'random').and_return(0)
          getRequestedImpedance(["uniform", 1000, 99900], [10, 20, 50]).should_be 1000
          getRequestedImpedance(["uniform", 1100, 99900], [10, 20, 50]).should_be 2000
          getRequestedImpedance(["uniform", 9000, 99900], [10, 20, 50]).should_be 10000
        end

        it "should return a value less than or equal to the <max> value, and in the list of steps (scaled to the appropriate order of magnitude)"
          stub(Math, 'random').and_return(0.99)
          // list of allowable values looks like [1000, 2000, 5000, 10000, 20000, 50000, 100000]
          getRequestedImpedance(["uniform", 1000,  99900], [10, 20, 50]).should_be  50000
          getRequestedImpedance(["uniform", 1000, 100000], [10, 20, 50]).should_be 100000
        end
      end
    end

  end

  describe "the defining parameter of a component, when (the magnitude) of the impedance is specified"

    describe "the resistance, when that component is a resistor"
      it "should be equal to the specified resistance"
        var circuit = [{
          "type": "resistor",
          "UID": "R1",
          "connections": "c3,b4",
          "resistance": "500"
        }];
        breadModel("createCircuit", circuit);

        getBreadBoard().components['R1'].resistance.should.be 500
      end
    end

    describe "the inductance, when that component is an inductor"
      it "should follow Z = |jwL| = wL, where w is the referenceFrequency converted to an angular value"
        var circuit = [{
          "type": "inductor",
          "UID": "L1",
          "connections": "c3,b4",
          "impedance": "500"
        }];
        circuit.referenceFrequency = 1000;

        breadModel("createCircuit", circuit);

        (getBreadBoard().components['L1'].getInductance() * 2 * Math.PI * 1000).should_be 500
      end
    end

    describe "the capacitance, when that component is an inductor"
      it "should follow Z = |-j/wC| = 1/wC, where w is the referenceFrequency converted to an angular value"
        var circuit = [{
          "type": "capacitor",
          "UID": "C1",
          "connections": "c3,b4",
          "impedance": "500"
        }];
        circuit.referenceFrequency = 1000;

        breadModel("createCircuit", circuit);

        (getBreadBoard().components['C1'].getCapacitance() / (2 * Math.PI * 1000)).should_be 500
      end
    end

  end
end
