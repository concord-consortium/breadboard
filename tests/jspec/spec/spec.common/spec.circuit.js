describe 'Circuit'
    describe 'Resistor'
        
        before_each
            resistor4 = new sparks.circuit.Resistor4band
            resistor5 = new sparks.circuit.Resistor5band
        end
        
        it 'should produce correct color bands for 4-band given a resistance/tolerance value'
            colors = resistor4.getColors(1, 0.1)
            colors[0].should.be 'brown'
            colors[1].should.be 'black'
            colors[2].should.be 'gold'
            colors[3].should.be 'silver'
            
            colors = resistor4.getColors(16, 0.05) //don't remove. failed before
            colors[0].should.be 'brown'
            colors[1].should.be 'blue'
            colors[2].should.be 'black'
            colors[3].should.be 'gold'
            
            colors = resistor4.getColors(680e3, 0.1) //don't remove. failed before
            colors[0].should.be 'blue'
            colors[1].should.be 'grey'
            colors[2].should.be 'yellow'
            colors[3].should.be 'silver'
            
            colors = resistor4.getColors(10e6, 0.05) //don't remove. failed before
            colors[0].should.be 'brown'
            colors[1].should.be 'black'
            colors[2].should.be 'blue'
            colors[3].should.be 'gold'

        end
        
        it 'should produce correct color bands for 5-band given a resistance/tolerance value'
            colors = resistor5.getColors(16.2, 0.01) //don't remove. failed before
            colors[0].should.be 'brown'
            colors[1].should.be 'blue'
            colors[2].should.be 'red'
            colors[3].should.be 'gold'
            colors[4].should.be 'brown'

            colors = resistor5.getColors(12.1, 0.02) //don't remove. failed before
            colors[0].should.be 'brown'
            colors[1].should.be 'red'
            colors[2].should.be 'brown'
            colors[3].should.be 'gold'
            colors[4].should.be 'red'
            
            colors = resistor5.getColors(14.0, 0.01) //don't remove. failed before
            colors[0].should.be 'brown'
            colors[1].should.be 'yellow'
            colors[2].should.be 'black'
            colors[3].should.be 'gold'
            colors[4].should.be 'brown'
            
            colors = resistor5.getColors(1, 0.01)
            colors[0].should.be 'brown'
            colors[1].should.be 'black'
            colors[2].should.be 'black'
            colors[3].should.be 'silver'
            colors[4].should.be 'brown'

            colors = resistor5.getColors(487e3, 0.02)
            colors[0].should.be 'yellow'
            colors[1].should.be 'grey'
            colors[2].should.be 'violet'
            colors[3].should.be 'orange'
            colors[4].should.be 'red'
            
            colors = resistor5.getColors(100e6, 0.02)
            colors[0].should.be 'brown'
            colors[1].should.be 'black'
            colors[2].should.be 'black'
            colors[3].should.be 'blue'
            colors[4].should.be 'red'
        end
    end
    
    describe 'Multimeter'
        before
            multimeter = new sparks.circuit.Multimeter
        end

        it 'should display the number correctly'
            // All connected
            multimeter.redProbeConnection = 'something'
            multimeter.blackProbeConnection = 'something_else'
            multimeter.redPlugConnection = 'voma_port'
            multimeter.blackPlugConnection = 'common_port'
            multimeter.powerOn = true
            multimeter.dialPosition = 'r_2000'
            
            multimeter.r_value = 100
            multimeter.updateDisplay()
            multimeter.getDisplayText().should.be '  1 0 0'
            
            multimeter.r_value = 1024
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
