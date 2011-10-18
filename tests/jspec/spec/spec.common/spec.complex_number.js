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

end
