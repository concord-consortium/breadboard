sparks.jsonSection = {
   "_id": "sams-five-resistors",
   "_rev": "4-954257a9f0218312e43d9d5599a6043c",
   "title": "Troubleshooting a five-resistor circuit",
   "show_multimeter": "true",
   "circuit": [
       {
           "type": "wire",
           "connections": "left_negative24,a30"
       },
       {
           "type": "wire",
           "connections": "left_positive1,a1"
       },
       {
           "type": "resistor",
           "UID": "r1",
           "connections": "b30,b24",
           "label": "R1"
       },
       {
           "type": "resistor",
           "UID": "r2",
           "connections": "c24,c18",
           "label": "R2"
       },
       {
           "type": "resistor",
           "UID": "r3",
           "connections": "c13,c7",
           "label": "R3"
       },
       {
           "type": "resistor",
           "UID": "r4",
           "connections": "b7,b1",
           "label": "R4"
       },
       {
           "type": "resistor",
           "UID": "r5",
           "connections": "f18,f12",
           "label": "R5"
       },
       {
           "type": "wire",
           "connections": "d24,g18"
       },
       {
           "type": "wire",
           "connections": "d7,g12"
       },
       {
           "type": "wire",
           "connections": "left_positive16,a18"
       },
       {
           "type": "wire",
           "connections": "left_negative10,a13"
       }
   ],
   "faults": [
       {
           "type": [
               "shorted",
               "open"
           ],
           "count": 1
       }
   ],
   "pages": [
       {
           "questions": [
               {
                   "prompt": "One of these resistors is bad.",
                   "subquestions": [
                       {
                           "prompt": "Which one is it?",
                           "options": [
                               {
                                   "option": "R1"
                               },
                               {
                                   "option": "R2"
                               },
                               {
                                   "option": "R3"
                               },
                               {
                                   "option": "R4"
                               },
                               {
                                   "option": "R5"
                               }
                           ],
                           "keepOrder": "true",
                           "tutorial": "woo.html",
                           "points": 10,
                           "scoring": "var badResistorName; if ((r1.resistance > 1e12)||(r1.resistance < 1e-5)) {badResistorName = 'R1'}  else if ((r2.resistance > 1e12)||(r2.resistance < 1e-5)) {badResistorName = 'R2'} else if ((r3.resistance > 1e12)||(r3.resistance < 1e-5)) {badResistorName = 'R3'} else if ((r4.resistance > 1e12)||(r4.resistance < 1e-5)) {badResistorName = 'R4'} else if ((r5.resistance > 1e12)||(r5.resistance < 1e-5)) {badResistorName = 'R5'}; if (question.answer === badResistorName) {question.points_earned = 10} question.correct_answer = badResistorName; console.log('from script, log = '+log); console.log(log); console.log('from script, this = ' + this); question.feedback = 'number of V measurements: '+log.uniqueVMeasurements()"
                       },
                       {
                           "prompt": "Is it shorted or open?",
                           "tutorial": "woo.html",
                           "options": [
                               {
                                   "option": "Shorted"
                               },
                               {
                                   "option": "Open"
                               }
                           ],
                           "keepOrder": "true",
                           "points": 5,
                           "scoring": "var natureOfFault; if ((r1.resistance > 1e12)||(r2.resistance > 1e12)||(r3.resistance > 1e12)||(r4.resistance > 1e12)||(r5.resistance > 1e12)) {natureOfFault = 'Open'} else if ((r1.resistance < 1e-5)||(r2.resistance < 1e-5)||(r3.resistance < 1e-5)||(r4.resistance < 1e-5)||(r5.resistance < 1e-5)) {natureOfFault = 'Shorted'}; if (question.answer === natureOfFault) {question.points_earned = 5} question.correct_answer = natureOfFault"
                       },
                       {
                            "prompt": "The answer to this question is yes",
                            "tutorial": "/woo.html",
                            "options": [
                                {
                                    "option": "yes",
                                    "points": 5
                                },
                                {
                                    "option": "no",
                                    "points": 0
                                }
                            ],
                            "keepOrder": "true",
                            "points": 5
                        }
                   ]
               }
           ]
       }
   ]
};