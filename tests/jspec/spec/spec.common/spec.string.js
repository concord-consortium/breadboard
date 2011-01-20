describe 'String'
  before
    str = sparks.string
  end

  it 'should do stripZeros correctly'
    str.stripZeros('12.40300').should.be '12.403'
    str.stripZeros('0.004').should.be '.004'
    str.stripZeros('4050.').should.be '4050.'
  end
  
end

