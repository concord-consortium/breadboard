describe 'Circuit Math'

  before_each
    breadModel('clear');
    
    var jsonCircuit = [
       {
         "type": "resistor",
         "UID": "r1",
         "connections": "c3,b4",
         "resistance": "100",
         "nominalResistance": "200"
       },
       {
         "type": "resistor",
         "UID": "r2",
         "connections": "c5,b6",
         "resistance": "300"
       },
       {
          "type": "resistor",
          "UID": "r3",
          "connections": "c6,b7",
          "resistance": "300"
        }
     ];
     
     breadModel("createCircuit", jsonCircuit);
  end
  
  it 'should be able to calculate series resistances'
    cMath.rSeries("r1", "r2").should.be 400
    cMath.rSeries("r1", "r2", "r3").should.be 700
    
    cMath.rNominalSeries("r1", "r2").should.be 500
  end
  
  it 'should be able to calculate parallel resistances'
    cMath.rParallel("r1", "r2").should.be 75
    cMath.rParallel("r1", "r2", "r3").should.be 60
  end
  
  it 'should be able to calculate voltage divider correctly'
    cMath.vDiv("r1", "r2").should.be 0.25
  end
  
end
