describe 'Complex number'

  it 'should parse complex numbers from Sparks correctly'
  
    var cn = sparks.ComplexNumber.parse("+1.00000000000e+03");
    cn.real.should.be 1e3
    cn.imag.should.be 0
    
    cn = sparks.ComplexNumber.parse("-1.95000000000e+02+j4.92889189986e-16");
    cn.real.should.be -195
    cn.imag.should.be 4.92889189986e-16
    
    cn = sparks.ComplexNumber.parse("+1.95000000000e+02-j2.00000000000e+3");
    cn.real.should.be 195
    cn.imag.should.be -2e3
    
    cn = sparks.ComplexNumber.parse("gobbledeegook");
    cn.should.be null
    
  end
  
  it "should calculate magnitudes and angles correctly"
  
    // yes IEEE 754 skeptics the following works:
    cn = sparks.ComplexNumber.parse("1");
    cn.magnitude.should.be 1
    cn.angle.should.be     0
    
    cn = sparks.ComplexNumber.parse("1+j1");
    cn.magnitude.should.be Math.SQRT2
    cn.angle.should.be     Math.PI / 4
    
    cn = sparks.ComplexNumber.parse("0+j1");
    cn.magnitude.should.be 1
    cn.angle.should.be     Math.PI / 2
    
    cn = sparks.ComplexNumber.parse("-1+j1");
    cn.magnitude.should.be Math.SQRT2
    cn.angle.should.be     (3 * Math.PI) / 4
    
    cn = sparks.ComplexNumber.parse("-1");
    cn.magnitude.should.be 1
    cn.angle.should.be     Math.PI
    
    cn = sparks.ComplexNumber.parse("-1-j1");
    cn.magnitude.should.be Math.SQRT2
    cn.angle.should.be     (-3 * Math.PI) / 4
    
    cn = sparks.ComplexNumber.parse("0-j1");
    cn.magnitude.should.be 1
    cn.angle.should.be     -1 * Math.PI / 2

    cn = sparks.ComplexNumber.parse("1-j1");
    cn.magnitude.should.be Math.SQRT2
    cn.angle.should.be     -1 * Math.PI / 4

  end

end
