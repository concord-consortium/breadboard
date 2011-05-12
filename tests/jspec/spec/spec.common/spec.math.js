describe 'Math'

  it 'should calculate log 10 correctly'
    Math.log10(10).should.be 1
    Math.log10(100).should.be 2
  end
  
  it 'should calculate powNdigits correctly'
    Math.powNdigits(5, 2).should.be 0.1
    Math.powNdigits(10, 2).should.be 1
  end
  
  it 'should calculate significant figures correctly'
    Math.toSigFigs(34.56,1).should.be "30"
    Math.toSigFigs(34.56,2).should.be "35"
    Math.toSigFigs(34.56,3).should.be "34.6"
    Math.toSigFigs(34.56,4).should.be "34.56"
    Math.toSigFigs(34.56,5).should.be "34.560"
  end
  
end
