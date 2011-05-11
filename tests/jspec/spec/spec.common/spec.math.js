describe 'Math'

  it 'should calculate log 10 correctly'
    Math.log10(10).should.be 1
    Math.log10(100).should.be 2
  end
  
  it 'should calculate powNdigits correctly'
    Math.powNdigits(5, 2).should.be 0.1
    Math.powNdigits(10, 2).should.be 1
  end
  
end
