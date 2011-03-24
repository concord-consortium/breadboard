sparks.jsonSection = {
  "title": "Interpreting a Series-Parallel Circuit",
  "show_multimeter": "false",
  "circuit": [
      {
        "type": "resistor",
        "UID": "r1",
        "connections": "c21,c15",
        "label": "R1"
      },
      {
        "type": "resistor",
        "UID": "r2",
        "connections": "a15,a9",
        "label": "R2"
      },
      {
        "type": "resistor",
        "UID": "r3",
        "connections": "e15,e9",
        "label": "R3"
      },
      {
        "type": "wire",
        "connections": "left_positive20,a21"
      },
      {
        "type": "wire",
        "connections": "left_negative5,c9"
      }
   ],
  "questions": [
    {
      "prompt": "What is the rated resistance of",
      "subquestions": [
        {
          "prompt": "R<sub>1</sub>:",
          "shortPrompt": "Resistance of R1",
          "correct_answer": "[${r1.nominalResistance}]",
          "correct_units": "ohms"
        },
        {
          "prompt": "R<sub>2</sub>:",
          "shortPrompt": "Resistance of R2",
          "correct_answer": "[${r2.nominalResistance}]",
          "correct_units": "ohms"
        },
        {
          "prompt": "R<sub>3</sub>:",
          "shortPrompt": "Resistance of R3",
          "correct_answer": "[${r3.nominalResistance}]",
          "correct_units": "ohms"
        }
      ]
    },
    {
      "prompt": "What is the total rated resistance across all the resistors? ",
      "shortPrompt": "Total resistance",
      "correct_answer": "[${r1.nominalResistance} + ( 1 / ( (1 / ${r2.nominalResistance}) + (1 / ${r3.nominalResistance})))]",
      "correct_units": "ohms"
    },
    {
      "prompt": "Given that the battery is producing 9 Volts, what is the voltage drop across",
      "subquestions": [
        {
          "prompt": "R<sub>1</sub>:",
          "shortPrompt": "Voltage across R1",
          "correct_answer": "[ 9 * ${r1.nominalResistance} / (${r1.nominalResistance} + ( 1 / ( (1 / ${r2.nominalResistance}) + (1 / ${r3.nominalResistance}))) ) ]",
          "correct_units": "V"
        },
        {
          "prompt": "R<sub>2</sub>:",
          "shortPrompt": "Voltage across R2",
          "correct_answer": "[ 9 * ( 1 -   ${r1.nominalResistance} / (${r1.nominalResistance} + ( 1 / ( (1 / ${r2.nominalResistance}) + (1 / ${r3.nominalResistance}))) )    )]",
          "correct_units": "V"
        },
        {
          "prompt": "R<sub>3</sub>:",
          "shortPrompt": "Voltage across R3",
          "correct_answer": "[ 9 * ( 1 -   ${r1.nominalResistance} / (${r1.nominalResistance} + ( 1 / ( (1 / ${r2.nominalResistance}) + (1 / ${r3.nominalResistance}))) )    )]",
          "correct_units": "V"
        }
       ]
    },
    {
      "prompt": "What is the current through",
      "subquestions": [
        {
          "prompt": "R<sub>1</sub>:",
          "shortPrompt": "Current through R1",
          "correct_answer": "[ 9 * ${r1.nominalResistance} / (${r1.nominalResistance} + ( 1 / ( (1 / ${r2.nominalResistance}) + (1 / ${r3.nominalResistance}))) ) / ${r1.nominalResistance} ]",
          "correct_units": "A"
        },
        {
          "prompt": "R<sub>2</sub>:",
          "shortPrompt": "Current through R2",
          "correct_answer": "[ ( 9 / ${r2.nominalResistance} ) * ((( 1 / ( (1/${r2.nominalResistance})+(1/${r2.nominalResistance}) ) )))  / (  ((( 1 / ( (1/${r2.nominalResistance})+(1/${r2.nominalResistance}) ) ))) + ${r1.nominalResistance} ) ]",
          "correct_units": "A"
        },
        {
          "prompt": "R<sub>3</sub>:",
          "shortPrompt": "Current through R3",
          "correct_answer": "[ ( 9 / ${r3.nominalResistance} ) * ((( 1 / ( (1/${r2.nominalResistance})+(1/${r2.nominalResistance}) ) )))  / (  ((( 1 / ( (1/${r2.nominalResistance})+(1/${r2.nominalResistance}) ) ))) + ${r1.nominalResistance} ) ]",
          "correct_units": "A"
        }      ]
    },
    {
      "prompt": "What is the voltage across",
      "subquestions": [
        {
          "prompt": "R<sub>1</sub> and R<sub>2</sub>:",
          "shortPrompt": "Voltage across R1 and R2",
          "correct_answer": "[ 9 ]",
          "correct_units": "V"
        },
        {
          "prompt": "R<sub>1</sub> and R<sub>3</sub>:",
          "shortPrompt": "Voltage across R1 and R3",
          "correct_answer": "[ 9 ]",
          "correct_units": "V"
        }
      ]
    }
  ]
};