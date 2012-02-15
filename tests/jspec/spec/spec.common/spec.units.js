describe 'Units'

  before
    u = sparks.unit
  end

  it 'should set engineering values correctly'
    
    u.toEngineering(0, "ohms").value.should.be 0
    u.toEngineering(0, "ohms").units.should.be "ohms"
    
    u.toEngineering(0.0000001, "ohms").value.should.be 100
    u.toEngineering(0.0000001, "ohms").units.should.be "nanoohms"
    
    u.toEngineering(0.000001, "ohms").value.should.be 1
    u.toEngineering(0.000001, "ohms").units.should.be "microohms"
    
    u.toEngineering(0.00001, "ohms").value.should.be 10
    u.toEngineering(0.00001, "ohms").units.should.be "microohms"
    
    u.toEngineering(0.0001, "ohms").value.should.be 100
    u.toEngineering(0.0001, "ohms").units.should.be "microohms"
    
    u.toEngineering(0.001, "ohms").value.should.be 1
    u.toEngineering(0.001, "ohms").units.should.be "milliohms"
    
    u.toEngineering(0.01, "ohms").value.should.be 10
    u.toEngineering(0.01, "ohms").units.should.be "milliohms"
    
    u.toEngineering(0.1, "ohms").value.should.be 100
    u.toEngineering(0.1, "ohms").units.should.be "milliohms"
    
    u.toEngineering(1, "ohms").value.should.be 1
    u.toEngineering(1, "ohms").units.should.be "ohms"
    
    u.toEngineering(10, "ohms").value.should.be 10
    u.toEngineering(10, "ohms").units.should.be "ohms"
    
    u.toEngineering(100, "ohms").value.should.be 100
    u.toEngineering(100, "ohms").units.should.be "ohms"
    
    u.toEngineering(1000, "ohms").value.should.be 1
    u.toEngineering(1000, "ohms").units.should.be "kiloohms"
    
    u.toEngineering(10000, "ohms").value.should.be 10
    u.toEngineering(10000, "ohms").units.should.be "kiloohms"
    
    u.toEngineering(100000, "ohms").value.should.be 100
    u.toEngineering(100000, "ohms").units.should.be "kiloohms"
    
    u.toEngineering(1000000, "ohms").value.should.be 1
    u.toEngineering(1000000, "ohms").units.should.be "megaohms"
    
    u.toEngineering(10000000, "ohms").value.should.be 10
    u.toEngineering(10000000, "ohms").units.should.be "megaohms"
    
    u.toEngineering(100000000, "ohms").value.should.be 100
    u.toEngineering(100000000, "ohms").units.should.be "megaohms"

  end
  
  it 'should round to two places correctly'
    u.toEngineering(0.000000123456, "ohms").value.should.be 123.46
    u.toEngineering(0.000000123456, "ohms").units.should.be "nanoohms"
    
    u.toEngineering(0.00000123456, "ohms").value.should.be 1.23
    u.toEngineering(0.00000123456, "ohms").units.should.be "microohms"
    
    u.toEngineering(0.0000123456, "ohms").value.should.be 12.35
    u.toEngineering(0.0000123456, "ohms").units.should.be "microohms"
    
    u.toEngineering(0.000123456, "ohms").value.should.be 123.46
    u.toEngineering(0.000123456, "ohms").units.should.be "microohms"
    
    u.toEngineering(0.00123456, "ohms").value.should.be 1.23
    u.toEngineering(0.00123456, "ohms").units.should.be "milliohms"
    
    u.toEngineering(0.0123456, "ohms").value.should.be 12.35
    u.toEngineering(0.0123456, "ohms").units.should.be "milliohms"
    
    u.toEngineering(0.123456, "ohms").value.should.be 123.46
    u.toEngineering(0.123456, "ohms").units.should.be "milliohms"
    
    u.toEngineering(1.23456, "ohms").value.should.be 1.23
    u.toEngineering(1.23456, "ohms").units.should.be "ohms"
    
    u.toEngineering(10, "ohms").value.should.be 10
    u.toEngineering(10, "ohms").units.should.be "ohms"
    
    u.toEngineering(100, "ohms").value.should.be 100
    u.toEngineering(100, "ohms").units.should.be "ohms"
    
    u.toEngineering(1000, "ohms").value.should.be 1
    u.toEngineering(1000, "ohms").units.should.be "kiloohms"
    
    u.toEngineering(10000, "ohms").value.should.be 10
    u.toEngineering(10000, "ohms").units.should.be "kiloohms"
    
    u.toEngineering(100000, "ohms").value.should.be 100
    u.toEngineering(100000, "ohms").units.should.be "kiloohms"
    
    u.toEngineering(1000000, "ohms").value.should.be 1
    u.toEngineering(1000000, "ohms").units.should.be "megaohms"
    
    u.toEngineering(10000000, "ohms").value.should.be 10
    u.toEngineering(10000000, "ohms").units.should.be "megaohms"
    
    u.toEngineering(100000000, "ohms").value.should.be 100
    u.toEngineering(100000000, "ohms").units.should.be "megaohms"
  end

  it 'should convert strings to measurements'
    u.convertMeasurement("1000 ohms").should.be "1 kiloohms"
    u.convertMeasurement("0.1ohms").should.be "100 milliohms"
    u.convertMeasurement("1.1 V").should.be "1.1 V"
  end
  
  it 'should parse entered measurements correctly'
    var tests = {
      "29":             "29  ",
      "29V":            "29  V",
      "29 V":           "29  V",
      "29. V":          "29  V",
      " 29V":           "29  V",
      "0.29V":          "0.29  V",
      ".29V":           "0.29  V",
      "-29V":           "-29  V",
      "29 m-V":         "0.029  V",  
      "29.1  mV  ":     "0.0291  V",
      "29.1mili V":     "0.0291  V",
      "29.1mVolts":     "0.0291  V",
      "29.1microVolts": "0.0000291  V",
      "29.1microvolts": "0.0000291  V",
      "29.1MV":         "29100000  V",
      "29.1 MicroVolts":  "0.0000291  V",
      "2,000.1 volts":    "2000.1  V",
      "it's 200 volts":   "200  V",
      "200 degrees":      "200  deg",
      "2 nf":             "2e-9  F",
      "2%":               "2  %",
      "2 percent":        "2  %",
      "2 kilocats":       "2000  cats",
      "200 degreses":     "200  degreses",
      "it's 300 degreses": "300  degreses"
    }
    
    for (example in tests) {
      var expectedResult = tests[example],
          value = u.parse(example),
          result = value.val + "  " + value.units;
      result.should.be expectedResult
    }
  end
  
end
