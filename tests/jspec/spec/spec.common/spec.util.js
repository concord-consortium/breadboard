describe 'Unit'

  describe 'nomalize'
    it 'should normalize resistance values correctly'
      Unit.normalizeToOhms(0, Unit.labels.ohms).should.be 0
      Unit.normalizeToOhms(0, Unit.labels.kilo_ohms).should.be 0
      Unit.normalizeToOhms(1000, Unit.labels.ohms).should.be 1000
      Unit.normalizeToOhms(10, Unit.labels.kilo_ohms).should.be 10000
      Unit.normalizeToOhms(10, Unit.labels.mega_ohms).should.be 10e6
    end
  end
  
  describe 'compatibility'
    it 'should determine compatibility of units'
      Unit.ohmCompatible(Unit.labels.ohms).should.be true
      Unit.ohmCompatible(Unit.labels.kilo_ohms).should.be true
      Unit.ohmCompatible(Unit.labels.mega_ohms).should.be true
    end
  end

end
