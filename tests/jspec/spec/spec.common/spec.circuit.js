describe 'Circuit'
    describe 'Resistor'
        before
            resistor = new Resistor5band
        end
        
        it 'should randomize its values within ranges'
            for (var i = 0; i < 20; ++i) {
                resistor.randomize()
                resistor.getNominalValue().should.be_at_least 1.0
                resistor.nominalValue.should.be_less_than 2e6
                resistor.colors.should.have_length 5
                for (var j = 0; j < resistor.colors.length; ++j) {
                    jspec_sparks.objectValues(resistor.colorMap).should.include resistor.colors[j]
                }
            }
        end
    end
    
    describe 'Multimeter'
        before
            multimeter = new Multimeter
        end

        it 'should display the number correctly'
            // All connected
            multimeter.redProbeConnection = 'something'
            multimeter.blackProbeConnection = 'something_else'
            multimeter.redPlugConnection = 'voma_port'
            multimeter.blackPlugConnection = 'common_port'
            multimeter.powerOn = true
            multimeter.dialPosition = 'r_2000'
            
            multimeter.value = 100
            multimeter.updateDisplay()
            multimeter.getDisplayText().should.be '  1 0 0'
            
            multimeter.value = 1024
            multimeter.dialPosition = 'r_200'
            multimeter.updateDisplay()
            multimeter.getDisplayText().should.be ' 1   . '
            
            multimeter.dialPosition = 'r_2000'
            multimeter.updateDisplay()
            
            multimeter.dialPosition = 'r_20k'
            multimeter.updateDisplay()
            multimeter.getDisplayText().should.be '  1.0 2'
            
            multimeter.dialPosition = 'r_200k'
            multimeter.updateDisplay()
            multimeter.getDisplayText().should.be '  0 1.0'
            
            multimeter.dialPosition = 'r_2000k'
            multimeter.updateDisplay()
            multimeter.getDisplayText().should.be '  0 0 1'
            
            // power off
            multimeter.powerOn = false
            multimeter.updateDisplay()
            multimeter.getDisplayText().should.be '       '
            
        end
    end
end
