describe 'Circuit'
    describe 'Resistor'
        function listEqual(a, b) {
            if (a.length !== b.length) {
                return false;
            }
            for (var i = 0; i < a.length; ++a) {
                if (a[i] !== b[i]) {
                    return false;
                }
            }
            return true;
        }

        before_each
            resistor4 = new Resistor4band
            resistor5 = new Resistor5band
        end
        
        it 'should randomize its values within ranges'
            resistor = resistor5
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
        
        it 'should produce correct color bands given a resistance/tolerance value'
            colors = resistor5.getColors(16.2, 0.01)
            colors[0].should.be 'brown'
            colors[1].should.be 'blue'
            colors[2].should.be 'red'
            colors[3].should.be 'gold'
            colors[4].should.be 'brown'

            colors = resistor5.getColors(12.1, 0.02)
            colors[0].should.be 'brown'
            colors[1].should.be 'red'
            colors[2].should.be 'brown'
            colors[3].should.be 'gold'
            colors[4].should.be 'red'
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
