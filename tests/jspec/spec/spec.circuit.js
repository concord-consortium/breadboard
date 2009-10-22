describe 'Circuit'
    describe 'Resistor'
        before
            resistor = new Resistor
        end
        
        it 'should randomize its values within ranges'
        /*
            for (var i = 0; i < 20; ++i) {
                resistor.randomize()
                resistor.nominalValue.should.be_at_least 1.0 // min value: 1
                resistor.nominalValue.should.be_less_than 2e6 // max value: 2,000k
                resistor.colors.should.have_length 5 // 5 band resistor
                for (var j = 0; j < resistor.colors.length; ++j) {
                    jspec_sparks.objectValues(resistor.colorMap).should.include(resistor.colors[j]);
                }
            }
            */
        end
    end
    
    describe 'Multimeter'
        before
            multimeter = new Multimeter
        end

        it 'should display the number correctly'
            multimeter.redProbeConnection = 'something';
            multimeter.blackProbeConnection = 'something_else';
            multimeter.redPlugConnection = 'voma_port';
            multimeter.blackPlugConnection = 'common_port';
            multimeter.dialPosition = 'r_2000';
            multimeter.powerOn = true;

            multimeter.value = 100
            multimeter.updateDisplay()
            multimeter.getDisplayText().should.be '  1 0 0'
        end
    end
end
