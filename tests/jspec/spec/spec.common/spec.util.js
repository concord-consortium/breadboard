describe 'Unit'

  before
    u = sparks.unit
  end

  it 'should normalize resistance values correctly'
    u.normalizeToOhms(0, u.labels.ohms).should.be 0
    u.normalizeToOhms(0, u.labels.kilo_ohms).should.be 0
    u.normalizeToOhms(1000, u.labels.ohms).should.be 1000
    u.normalizeToOhms(10, u.labels.kilo_ohms).should.be 10000
    u.normalizeToOhms(10, u.labels.mega_ohms).should.be 10e6
  end

  it 'should determine compatibility of units'
    u.ohmCompatible(u.labels.ohms).should.be true
    u.ohmCompatible(u.labels.kilo_ohms).should.be true
    u.ohmCompatible(u.labels.mega_ohms).should.be true
  end
  
  it 'should run res_str correctly'
    u.res_str(20).should.be '20 ' + u.labels.ohms
    u.res_str(200).should.be '200 ' + u.labels.ohms
    u.res_str(2000).should.be '2 ' + u.labels.kilo_ohms
    u.res_str(200e3).should.be '200 ' + u.labels.kilo_ohms
    
    u.res_str(26.8519999999).should.be '26.852 ' + u.labels.ohms
    u.res_str(0.0008000000004).should.be '0.0008 ' + u.labels.ohms
  end

end
