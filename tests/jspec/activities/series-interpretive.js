sparks.jsonSection = {
  "_id": "series-e-1",
     "_rev": "38-948933dd8bec8b038eb06b47333ea562",
     "title": "Measuring Series Circuits",
     "circuit": [
         {
             "type": "wire",
             "UID": "w1",
             "connections": "left_positive20,a23",
             "label": "wire1"
         },
         {
             "type": "resistor",
             "UID": "r1",
             "connections": "b23,b17",
             "label": "R1"
         },
         {
             "type": "resistor",
             "UID": "r2",
             "connections": "c17,c11",
             "label": "R2"
         },
         {
             "type": "resistor",
             "UID": "r3",
             "connections": "d11,d5",
             "label": "R3"
         },
         {
             "type": "wire",
             "UID": "w2",
             "connections": "a5,left_negative2",
             "label": "wire2"
         }
     ],
     "show_multimeter": "true",
     "pages": [
         {
             "time": {
                 "best": 60,
                 "worst": 173,
                 "points": 40,
                 "threshold": 40
             },
             "notes": "The actual resistances of each resistor may differ from its labeled value.<br><br>Unfortunately, the internal battery of the DMM is dead, so the DMM is unable to measure resistance.",
             "questions": [
                 {
                     "prompt": "Use the DMM to measure the circuit above.",
                     "subquestions": [
                         {
                             "prompt": "<hr>What is the voltage dropped across all the resistors?<br>",
                             "shortPrompt": "Voltage across circuit",
                             "options": [
                                 {
                                     "option": "9 V",
                                     "points": 10,
                                     "feedback": "Right! The circuit voltage is measured across all three resistors."
                                 },
                                 {
                                     "option": "[var R1 = r1.resistance; var R2 = r2.resistance; var R3 = r3.resistance; var ANS = 9*R1/(R1+R2+R3); var numDigits = 3; if (Math.floor(ANS/Math.powNdigits(ANS,1)) == 1) {numDigits = 4}; Math.toSigFigs(ANS,numDigits)] V",
                                     "points": 2,
                                     "feedback": "Oops! This is the voltage measured across just one resistor, R1. You need to measure across <b>all three resistors</b> to find the voltage supplied to the circuit."
                                 },
                                 {
                                     "option": "[var R1 = r1.resistance; var R2 = r2.resistance; var R3 = r3.resistance; var ANS = 9*R2/(R1+R2+R3); var numDigits = 3; if (Math.floor(ANS/Math.powNdigits(ANS,1)) == 1) {numDigits = 4}; Math.toSigFigs(ANS,numDigits)] V",
                                     "points": 0,
                                     "feedback": "Oops! This is the voltage measured across just one resistor, R2. You need to measure across <b>all three resistors</b> to find the voltage supplied to the circuit."
                                 },
                                 {
                                     "option": "[var R1 = r1.resistance; var R2 = r2.resistance; var R3 = r3.resistance; var ANS = 9*R3/(R1+R2+R3); var numDigits = 3; if (Math.floor(ANS/Math.powNdigits(ANS,1)) == 1) {numDigits = 4}; Math.toSigFigs(ANS,numDigits)] V",
                                     "points": 0,
                                     "feedback": "Oops! This is the voltage measured across just one resistor, R3. You need to measure across <b>all three resistors</b> to find the voltage supplied to the circuit."
                                 },
                                 {
                                     "option": "[var R1 = r1.resistance; var R2 = r2.resistance; var R3 = r3.resistance; var ANS = 9/(R1+R2+R3); var numDigits = 3; if (Math.floor(ANS/Math.powNdigits(ANS,1)) == 1) {numDigits = 4}; Math.toSigFigs(ANS,numDigits)] V",
                                     "points": 0,
                                     "feedback": "Isn't this actually the current measurement value? You need to use the DMM in voltage mode and measure across all three resistors."
                                 },
                                 {
                                     "option": "[var R1 = r1.resistance; var R2 = r2.resistance; var R3 = r3.resistance; var ANS = 9*(R2+R1)/(R1+R2+R3); var numDigits = 3; if (Math.floor(ANS/Math.powNdigits(ANS,1)) == 1) {numDigits = 4}; Math.toSigFigs(ANS,numDigits)] V",
                                     "points": 0,
                                     "feedback": "This appears to be the voltage across two resistors. You need to measure across all three resistors."
                                 },
                                 {
                                     "option": "[var R1 = r1.resistance; var R2 = r2.resistance; var R3 = r3.resistance; var ANS = 9*(R2+R3)/(R1+R2+R3); var numDigits = 3; if (Math.floor(ANS/Math.powNdigits(ANS,1)) == 1) {numDigits = 4}; Math.toSigFigs(ANS,numDigits)] V",
                                     "points": 0,
                                     "feedback": "This appears to be the voltage across two resistors. You need to measure across all three resistors."
                                 },
                                 {
                                     "option": "[var ANS = 9-(1+7*Math.random()); Math.toSigFigs(ANS,1)] V",
                                     "points": 0,
                                     "tutorial": "tutorial-7",
                                     "feedback": "Are you guessing? You need to use the DMM in voltage mode to measure the voltage across all three resistors. See the tutorial for more help."
                                 },
                                 {
                                     "option": "[var ANS = 9+(1+7*Math.random()); Math.toSigFigs(ANS,1)] V",
                                     "points": 0,
                                     "tutorial": "tutorial-7",
                                     "feedback": "Are you guessing? You need to use the DMM in voltage mode to measure the voltage across all three resistors. See the tutorial for more help."
                                 }
                             ]
                         },
                         {
                             "prompt": "<hr>What is the current flowing through the circuit?<br>",
                             "shortPrompt": "Current through circuit",
                             "options": [
                                 {
                                     "option": "[var R1 = r1.resistance; var R2 = r2.resistance; var R3 = r3.resistance; var ANS =9/(R1+R2+R3); var numDigits = 3; if (Math.floor(ANS/Math.powNdigits(ANS,1)) == 1) {numDigits = 4}; Math.toSigFigs(ANS,numDigits)] A",
                                     "points": 20,
                                     "feedback": "Right! The same current passes through all the resistors in a series circuit."
                                 },
                                 {
                                     "option": "[var R1 = r1.resistance; var R2 = r2.resistance; var R3 = r3.resistance; var ANS = 9/(R2+R3); var numDigits = 3; if (Math.floor(ANS/Math.powNdigits(ANS,1)) == 1) {numDigits = 4}; Math.toSigFigs(ANS,numDigits)] A",
                                     "points": 0,
                                     "tutorial": "tutorial-8",
                                     "feedback": "You must measure current differently than voltage: lift a lead to break the circuit, insert the DMM probes <b>into</b> the break, and then measure the current. If unsure, check out the tutorial."
                                 },
                                 {
                                     "option": "[var R1 = r1.resistance; var R2 = r2.resistance; var R3 = r3.resistance; var ANS = 9/(R1+R3); var numDigits = 3; if (Math.floor(ANS/Math.powNdigits(ANS,1)) == 1) {numDigits = 4}; Math.toSigFigs(ANS,numDigits)] A",
                                     "points": 0,
                                     "tutorial": "tutorial-8",
                                     "feedback": "You must measure current differently than voltage: lift a lead to break the circuit, insert the DMM probes <b>into</b> the break, and then measure the current. If unsure, check out the tutorial."
                                 },
                                 {
                                     "option": "[var R1 = r1.resistance; var R2 = r2.resistance; var R3 = r3.resistance; var ANS = 9/(R1+R2); var numDigits = 3; if (Math.floor(ANS/Math.powNdigits(ANS,1)) == 1) {numDigits = 4}; Math.toSigFigs(ANS,numDigits)] A",
                                     "points": 0,
                                     "tutorial": "tutorial-8",
                                     "feedback": "You must measure current differently than voltage: lift a lead to break the circuit, insert the DMM probes <b>into</b> the break, and then measure the current. If unsure, check out the tutorial."
                                 },
                                 {
                                     "option": "[var R1 = r1.resistance; var R2 = r2.resistance; var R3 = r3.resistance; var ANS = 9*R1/(R1+R2+R3)/99; var numDigits = 3; if (Math.floor(ANS/Math.powNdigits(ANS,1)) == 1) {numDigits = 4}; Math.toSigFigs(ANS,numDigits)] A",
                                     "points": 0,
                                     "tutorial": "tutorial-8",
                                     "feedback": "You need to use the DMM in current mode, break the circuit by lifting a lead, and insert the leads into the break. See the tutorial for more help."
                                 },
                                 {
                                     "option": "[var R1 = r1.resistance; var R2 = r2.resistance; var R3 = r3.resistance; var ANS = 9*R2/(R1+R2+R3)/99; var numDigits = 3; if (Math.floor(ANS/Math.powNdigits(ANS,1)) == 1) {numDigits = 4}; Math.toSigFigs(ANS,numDigits)] A",
                                     "points": 0,
                                     "tutorial": "tutorial-8",
                                     "feedback": "You need to use the DMM in current mode, break the circuit by lifting a lead, and insert the leads into the break. See the tutorial for more help."
                                 },
                                 {
                                     "option": "[var R1 = r1.resistance; var R2 = r2.resistance; var R3 = r3.resistance; var ANS = 9*R3/(R1+R2+R3)/99; var numDigits = 3; if (Math.floor(ANS/Math.powNdigits(ANS,1)) == 1) {numDigits = 4}; Math.toSigFigs(ANS,numDigits)] A",
                                     "points": 0,
                                     "tutorial": "tutorial-8",
                                     "feedback": "You need to use the DMM in current mode, break the circuit by lifting a lead, and insert the leads into the break. See the tutorial for more help."
                                 },
                                 {
                                     "option": "[var R1 = r1.resistance; var R2 = r2.resistance; var R3 = r3.resistance; var ANS = 9/(R1+R2+R3)*(1.03+0.03*Math.random()); var numDigits = 3; if (Math.floor(ANS/Math.powNdigits(ANS,1)) == 1) {numDigits = 4}; Math.toSigFigs(ANS,numDigits)] A",
                                     "points": 0,
                                     "tutorial": "tutorial-8",
                                     "feedback": "Are you guessing? You need to use the DMM in current mode, break the circuit by lifting a lead, and insert the leads into the break. See the tutorial for more help."
                                 },
                                 {
                                     "option": "[var R1 = r1.resistance; var R2 = r2.resistance; var R3 = r3.resistance; var ANS = 9/(R1+R2+R3)*(0.97-0.03*Math.random()); var numDigits = 3; if (Math.floor(ANS/Math.powNdigits(ANS,1)) == 1) {numDigits = 4}; Math.toSigFigs(ANS,numDigits)] A",
                                     "points": 0,
                                     "tutorial": "tutorial-8",
                                     "feedback": "Are you guessing? You need to use the DMM in current mode, break the circuit by lifting a lead, and insert the leads into the break. See the tutorial for more help."
                                 }
                             ]
                         },
                         {
                             "prompt": "<hr>What is the actual <b>total</b> resistance value for this circuit?",
                             "shortPrompt": "Total circuit resistance",
                             "options": [
                                 {
                                     "option": "[var R1 = r1.resistance; var R2 = r2.resistance; var R3 = r3.resistance; var ANS = R1+R2+R3; Math.toSigFigs(ANS,3)] ohms",
                                     "points": 30,
                                     "feedback": "Right! Using Ohm's Law with your measurements you found the actual total resistance of this circuit."
                                 },
                                 {
                                     "option": "[var R1 = r1.resistance; var ANS = R1; Math.toSigFigs(ANS,3)] ohms",
                                     "points": 0,
                                     "tutorial": "tutorial-6",
                                     "feedback": "Oops! You calculated the value for just one resistor. To calculate the resistance for all the resistors you use the <b>total</b> voltage and the <b>total</b> current. If you're unsure about this, check the tutorial."
                                 },
                                 {
                                     "option": "[var R2 = r2.resistance; var ANS = R2; Math.toSigFigs(ANS,3)] ohms",
                                     "points": 0,
                                     "tutorial": "tutorial-6",
                                     "feedback": "Oops! You calculated the value for just one resistor. To calculate the resistance for all the resistors you use the <b>total</b> voltage and the <b>total</b> current. If you're unsure about this, check the tutorial."
                                 },
                                 {
                                     "option": "[var R3 = r3.resistance; var ANS = R3; Math.toSigFigs(ANS,3)] ohms",
                                     "points": 0,
                                     "tutorial": "tutorial-6",
                                     "feedback": "Oops! You calculated the value for just one resistor. To calculate the resistance for all the resistors you use the <b>total</b> voltage and the <b>total</b> current. If you're unsure about this, check the tutorial."
                                 },
                                 {
                                     "option": "[var R1 = r1.resistance; var R2 = r2.resistance; var R3 = r3.resistance; var ANS = 9/(R1+R2+R3)*Math.pow(10,3+Math.floor(Math.log10(R1+R2+R3))); Math.toSigFigs(ANS,3)] ohms",
                                     "points": 0,
                                     "tutorial": "tutorial-6",
                                     "feedback": "Are you guessing? This is similar to the value for the current in the circuit. You need to calculate the resistance using the circuit voltage and the current. See the tutorial if you're unsure."
                                 },
                                 {
                                     "option": "[var R1 = r1.resistance; var R2 = r2.resistance; var R3 = r3.resistance; var ANS = (R1+R2+R3)*(1.03+0.03*Math.random()); Math.toSigFigs(ANS,3)] ohms",
                                     "points": 0,
                                     "tutorial": "tutorial-6",
                                     "feedback": "Did you make a calculation error? This is close to the correct resistance. See the tutorial if you're unsure."
                                 },
                                 {
                                     "option": "[var R1 = r1.resistance; var R2 = r2.resistance; var R3 = r3.resistance; var ANS = (R1+R2+R3)*(0.97-0.03*Math.random()); Math.toSigFigs(ANS,3)] ohms",
                                     "points": 0,
                                     "tutorial": "tutorial-6",
                                     "feedback": " Did you make a calculation error? This is close to the correct resistance. See the tutorial if you're unsure."
                                 },
                                 {
                                     "option": "[var R1=r1.resistance; var R2=r2.resistance; var R3=r3.resistance; var nR1=r1.nominalResistance; var nR2=r2.nominalResistance; var nR3=r3.nominalResistance; RTOT=Math.toSigFigs(R1+R2+R3,3); nRTOT=Math.toSigFigs(nR1+nR2+nR3,3); if (RTOT==nRTOT) {ANS=nRTOT*1.02;} else {ANS=nRTOT;}; ANS] ohms",
                                     "points": 0,
                                     "tutorial": "tutorial-6",
                                     "feedback": "Isn't this just the sum of the <b>labeled</b> R values? You need to <b>measure</b> the circuit to find to the actual circuit resistance. See the tutorial if you're unsure."
                                 }
                             ]
                         }
                     ]
                 }
             ]
         }
     ]
};