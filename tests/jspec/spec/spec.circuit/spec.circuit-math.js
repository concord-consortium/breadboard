describe 'Circuit Math'

  before_each
    breadModel('clear');
    
    var jsonCircuit = [
       {
         "type": "resistor",
         "UID": "r1",
         "connections": "c3,b4",
         "resistance": "100"
       },
       {
         "type": "resistor",
         "UID": "r2",
         "connections": "c5,b6",
         "resistance": "300"
       }
     ];
     
     breadModel("createCircuit", jsonCircuit);
  end
  
  it 'should be able to calculate series resistances'
    circMath.rSeries("r1", "r2").should.be 400
  end
  
  it 'should be able to calculate parallel resistances'
    circMath.rParallel("r1", "r2").should.be 75
  end
  
  it 'should calculate vDiv correctly'
    circMath.vDiv("r1", "r2").should.be 0.25
  end
  
end
