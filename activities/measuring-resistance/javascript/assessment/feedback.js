/* FILE feedback.js */

/**
 * A FeedbackItem is contains derived information from the activity log:
 * Grader parses the activity log and populates feedback items.
 * Reporter uses feedback items to generate the report.
 */
function FeedbackItem(maxPoints)
{
    // "correctness" on the scale of 0 to 4 for the purpose of labeling/coloring
    // 0 means incorrect, 4 correct, 1 thru 3 partially correct
    this.correct = 0;
    
    this.feedbacks = [];
    this.feedbackSpace = null; //set of all possible feedback messages
    this.points = 0;
    this.maxPoints = (maxPoints === null || maxPoints === undefined ? 0 : maxPoints);
}

FeedbackItem.prototype =
{
    getPoints : function () {
        var points = 0;
        for (var key in this) {
            if (this[key] instanceof FeedbackItem) {
                points += this[key].getPoints();
            }
        }
        return points + this.points;
    },
    
    getMaxPoints: function () {
        var maxPoints = 0;
        for (var key in this) {
            if (this[key] instanceof FeedbackItem) {
                maxPoints += this[key].getMaxPoints();
            }
        }
        return maxPoints + this.maxPoints;
    },
    
    addFeedback: function (key) {
        var messages = [];
        for (var i = 0; i < this.feedbackSpace[key].length; ++i) {
            messages[i] = this.feedbackSpace[key][i];
        }
        var subs = Array.prototype.slice.call(arguments, 1);
        this.feedbacks.push(this.processPatterns(key, messages, subs));
    },
    
    processPatterns: function (key, messages, substitutions) {
        return messages;
    }
};

function Feedback() {
    this.root = new FeedbackItem();

    this.root.reading = new FeedbackItem();
    this.root.reading.rated_r_value = new FeedbackItem(20);
    this.root.reading.rated_t_value = new FeedbackItem(5);

    this.root.measuring = new FeedbackItem();
    this.root.measuring.plug_connection = new FeedbackItem(5);
    this.root.measuring.probe_connection = new FeedbackItem(2);
    this.root.measuring.knob_setting = new FeedbackItem(20);
    this.root.measuring.power_switch = new FeedbackItem(2);
    this.root.measuring.measured_r_value = new FeedbackItem(10);
    this.root.measuring.task_order = new FeedbackItem(6);
    
    this.root.t_range = new FeedbackItem();
    this.root.t_range.t_range_value = new FeedbackItem(15);
    this.root.t_range.within_tolerance = new FeedbackItem(5);
    
    this.root.time = new FeedbackItem();
    this.root.time.reading_time = new FeedbackItem(5);
    this.root.time.measuring_time = new FeedbackItem(5);
    
    this.root.reading.rated_r_value.feedbackSpace = {
        correct: [
            'Correct interpretation of color bands',
            'Good work! You correctly interpreted the color bands used to label this resistor’s rated resistance value.'
        ],
        power_ten: [
            'Power-of-ten error',
            'Although you got the digits correct, based on the first ${number of bands} bands, you seemed to have trouble interpreting the power-of-ten band. This band determines the power of ten to multiply the digits from the first ${number of bands – 1} bands. See the Color Band tutorial for additional help.'
        ],
        difficulty: [
            'Apparent difficulty interpreting color bands',
            'One of the digits that you reported from the color bands was incorrect. Roll over each band to expand the color and double-check your interpretation of each color band before submitting your answer. See the Color Band tutorial for additional help.'
        ],
        incorrect: [
            'Incorrect interpretation of color bands',
            'The resistance value you submitted indicates that you misinterpreted more than one color band. You seem to be having difficulty using the color bands to determine the rated resistor value. See the Color Band tutorial for a table of band colors and the numbers they signify.'
        ],
        unit: [
            'Incorrect units (not resistance units)',
            'You mistakenly specified ${selected unit} in your answer. That is not a unit resistance of resistance. The base unit for resistance is the ohm.'
        ]
    };
    
    this.root.reading.rated_r_value.processPatterns = function (key, messages, subs) {
        if (key === 'power_ten') {
            messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                    '$1<font color="blue"><i>' + subs[0] +
                    '</i></font>$2<font color="blue"><i>' + subs[1] + '</i></font>$3');
        }
        else if (key === 'unit') {
            messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)/m,
                    '$1<font color="red"><i>' + subs[0] + '</i></font>$2');
        }
        return messages;
    };
    
    this.root.reading.rated_t_value.feedbackSpace = {
        correct: [
            'Correct interpretation of tolerance color band',
            'Good work! You correctly interpreted the color band used to label this resistor’s rated tolerance.'
        ],
        incorrect: [
            'Incorrect tolerance value',
            'You specified ${your tolerance-value}, rather than the correct tolerance value of ${tolerance value}. Next time, refer to the color code for the tolerance band. See the Color Band tutorial for additional help.'
        ]
    };
    
    this.root.reading.rated_t_value.processPatterns = function (key, messages, subs) {
        if (key === 'incorrect') {
            messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                '$1<font color="red"><i>' + subs[1] +
                '</i></font>$2<font color="blue"><i>' + subs[0] + '</i></font>$3');
        }
        return messages;
    };
    
    this.root.measuring.measured_r_value.feedbackSpace = {
        correct: [
            'Correct measured R value',
            'You correctly reported the value of this resistor as measured with the digital multimeter.'
        ],
        incomplete: [
            'Did not record complete value from DMM display.',
            'You should record all the digits displayed by the digital multimeter —don’t round the results. While the DMM displayed ${dmm-display}, your answer was ${your answer-value}.'
        ],
        power_ten: [
            'Power-of-ten error.',
            'While the digits you submitted from the digital multimeter display appear to be correct, the power of ten implied by the units you chose were incorrect. Your answer was ${your answer-value} ${your answer-units}, but the correct answer was ${answer-ohms}, ${answer-k-ohms}, or ${answer meg-ohms}.'
        ],
        incorrect: [
            'Not a measured value.',
            'Submitted value does not match a valued measured with the digital multimeter. The tutorial on this subject may help clarify this topic for you.'
        ],
        unit: [
            'Incorrect type of units.',
            'The result of a resistance measurement should be a resistance unit, such as Ω, kΩ, or MΩ, not ${your answer-unit}.'
        ]
    };
    
    this.root.measuring.measured_r_value.processPatterns = function (key, messages, subs) {
        if (key === 'incomplete') {
            messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                    '$1<font color="blue"><i>' + subs[0] +
                    '</i></font>$2<font color="red"><i>' + subs[1] + '</i></font>$3');
        }
        else if (key === 'power_ten') {
            messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)\$\{.*\}(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                    '$1<font color="orange"><i>' + subs[0] +
                    '</i></font>$2<font color="orange"><i>' + subs[1] +
                    '</i></font>$3<font color="blue"><i>' + subs[2] +
                    '</i></font>$4<font color="blue"><i>' + subs[3] +
                    '</i></font>$5<font color="blue"><i>' + subs[4] + '</i></font>$6');
        }
        else if (key === 'unit') {
            messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)/m,
                    '$1<font color="red"><i>' + subs[0] + '</i></font>$2');
        }
        return messages;
    };
    
    this.root.measuring.plug_connection.feedbackSpace = {
        correct: [
            'Correct connections to the DMM',
            'Good work. The probes were correctly connected to the digital multimeter for this measurement.'
        ],
        reverse: [
            'Connections to DMM are reversed',
            '<p>While the meter will still read resistance measurements ' +
            'correctly, it is good practice to always connect the red lead ' +
            'to the <font color="blue">VΩmA</font> jack, and the black lead ' +
            'to the <font color="blue">COM</font> jack of the DMM.</p>' +
            '<p>This will be essential when making correct measurements of voltage and current in later modules. See the Using the DMM tutorial for additional help.</p>'
        ],
        incorrect: [
            'Connections to the DMM are incorrect',
            '<p>The digital multimeter will not measure resistance unless the ' +
            'leads are plugged in correctly: red lead to ' +
            '<font color="blue">VΩmA</font> jack, black lead to ' +
            '<font color="blue">COM</font> jack.</p>' +
            '<p>While there is no risk in this case, it is good practice to be aware that any time you connect the leads to incorrect DMM jacks and to a circuit, you may damage the meter and/or your circuit. See the Using the DMM tutorial for additional help.</p>'
        ]
    };
    
    this.root.measuring.probe_connection.feedbackSpace = {
            correct: [
                'Correct connections to the resistor',
                'Good work. You correctly connected the probes to each end of the resistor to make your resistance measurement.'
            ],
            incorrect: [
                'Incorrect connections to the resistor',
                'You must connect one of the digital multimeter probes to each end of the resistor to make a resistance measurement. See the Using the DMM tutorial for additional help.'
            ]
    };
    
    this.root.measuring.knob_setting.feedbackSpace = {
        correct: [
            'Correct DMM knob setting.',
            'Good work. You set the digital multimeter knob to the correct resistance scale for this resistance measurement.'
        ],
        suboptimal: [
            'DMM knob set to incorrect resistance scale',
            '<p>While the digital multimeter knob was set to measure ' +
            'resistance, it was not set to display the optimal scale for ' +
            'this resistance measurement.</p><p>You chose ' +
            '${your-knob-setting}, but the best scale setting for your ' +
            'resistor would have been ${optimum-knob-setting}. See the ' +
            'Using the DMM tutorial for additional help.</p>'
        ],
        incorrect: [
            'DMM knob not set to a resistance scale',
            '<p>While there is no risk in this case, the digital multimeter ' +
            'knob should always be set to the proper type of measurement.</p>' +
            '<p>Here you are measuring resistance, and so the DMM knob ' +
            'should be set to a resistance scale, such as 2000Ω, 20kΩ, and ' +
            'so forth.</p><p>Any other knob-type setting, may damage either ' +
            'the meter and/or your circuit. See the Using the DMM tutorial ' +
            'for additional help.'
        ]
    };
    
    this.root.measuring.knob_setting.processPatterns = function (key, messages, subs) {
        if (key === 'suboptimal') {
            messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                    '$1<font color="orange"><i>' + subs[1] +
                    '</i></font>$2<font color="blue"><i>' + subs[0] + '</i></font>$3');
        }
        return messages;
    };
    
    this.root.measuring.power_switch.feedbackSpace = {
        correct: [
            'DMM turned ON',
            'Good work. You correctly turned on the digital multimeter to make this resistance measurement.'
        ],
        incorrect: [
            'DMM was not turned ON',
            '<p>The digital multimeter was off. A digital multimeter ' +
            'can only function with power supplied to the electronics within ' +
            'and the display.</p><p>In addition, when making resistance ' +
            'measurements, a DMM must supply a small amount of test current ' +
            'through the probes. See the Using the DMM tutorial for ' +
            'additional help.'
        ]
    };
    
    this.root.measuring.task_order.feedbackSpace = {
        correct: [
            'Order of tasks is acceptable.',
            'When measuring resistance, it is always a good practice to have the DMM knob set to a resistance function prior to turning ON the digital multimeter and connecting the probes to the circuit, just as you did.  Good job!'
        ],
        incorrect: [
            'Incorrect order of tasks',
            '<p>When measuring resistance, it is not good practice to have the digital multimeter knob set to a non-resistance function when it is turned on and connected to a circuit.</p><p>At some point during this session, we noted that this condition occurred.</p><p>Next time, turn the DMM knob to a resistance function before connecting the leads to the resistor. See the Using the DMM tutorial for additional help.</p>'
        ]
    };
    
    this.root.t_range.t_range_value.feedbackSpace = {
        correct: [
            'Correct calculation',
            'You correctly applied the ${tolerance-band-number} tolerance band to the ${resistor-value} resistor value to calculate the tolerance range for this resistor, and included all the digits in your answer. Good work.'
        ],
        rounded: [
            'Rounded result',
            'You appeared to correctly apply the ${tolerance-band-number} tolerance band to the ${resistor-value} resistor value to calculate the tolerance range for this resistor, but you seem to have rounded your answer. For this activity, we recommend you report as many digits as the rated value of the resistance has. For instance, if the rated resistance is 12,300 ohms, based on a reading of a five color band resistor, you should report the minimum and maximum values of the tolerance range to three significant digits.'
        ],
        inaccurate: [
            'Inaccurate tolerance',
            'The tolerance range that you specified is close but incorrect. You reported ${student’s-tolerance-range} but the correct answer was ${correct-tolerance-range}. See the Calculating Tolerance tutorial for additional help.'
        ],
        wrong: [
            'Wrong tolerance',
            'The tolerance range that you specified is incorrect. You reported ${student’s-tolerance-range} but the correct answer was ${correct-tolerance-range}. See the Calculating Tolerance tutorial for additional help.'
        ]
    };
    
    this.root.t_range.t_range_value.processPatterns = function (key, messages, subs) {
        if (key === 'correct' || key === 'rounded') {
            messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                '$1<font color="blue"><i>' + subs[1] +
                '</i></font>$2<font color="blue"><i>' + subs[0] + '</i></font>$3');
        }
        else if (key === 'inaccurate' || key === 'wrong') {
            messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                '$1<font color="red"><i>' + subs[1] +
                '</i></font>$2<font color="blue"><i>' + subs[0] + '</i></font>$3');
        }
        return messages;
    };
    
    this.root.t_range.within_tolerance.feedbackSpace = {
        correct: [
            'Measurement recognized as in/out of tolerance',
            'Good work. The measured value, ${your answer-value}, should fall within the tolerance range, that is between the minimum ${min-resistance-value} and the maximum ${max resistance value} that you calculated based on the tolerance percentage. Since the measured value of this resistor ${did|did not} fall within this range, this resistor ${is|is not} within tolerance.'
        ],
        incorrect: [
            'Measurement not recognized as in/out of tolerance',
            'The measured value, ${your answer-value}, should fall within the tolerance range, that is between the minimum ${min-resistance-value} and the maximum ${max resistance value} that you calculated based on the tolerance percentage. Since the measured value ${did|did not} fall within this range, this resistor ${is|is not} within tolerance.'
        ],
        undef: [
            'Previous question(s) incorrect',
            "You answer to either the measuring resistance question or the tolerance range question was incorrect, so you didn't have enough information to answer this question."
        ]
    };
    
    this.root.t_range.within_tolerance.processPatterns = function (key, messages, subs) {
        if (key === 'correct' || key === 'incorrect') {
            messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)\$\{.*\}(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                    '$1<font color="green"><i>' + subs[0] +
                    '</i></font>$2<font color="blue"><i>' + subs[1] +
                    '</i></font>$3<font color="blue"><i>' + subs[2] +
                    '</i></font>$4<font color="green"><i>' + subs[3] +
                    '</i></font>$5<font color="green"><i>' + subs[4] + '</i></font>$6');
        }
        return messages;
    };
    
    this.root.time.reading_time.feedbackSpace = {
        efficient: [
            'Very efficient!',
            'For this assessment, remembering and quickly interpreting the color bands on a resistor is the key to entering your answer in less than 20 seconds. You did this! Good work!'
        ],
        semi: [
            'Can you speed it up?',
            'For this assessment, you should be able to remember and interpret the color bands on a resistor, and then enter your answer in less than 20 seconds. Are you still looking up each color? Try memorizing the color code and get familiar with the key strokes to enter the values. See the Color Band tutorial for additional help and try again.'
        ],
        slow: [
            'Too slow',
            'For this assessment, you should be able to remember and interpret the color bands on a resistor, and then enter your answer in less 20 seconds. You took ${your-time} seconds. That’s too long! Are you still having to look up each color? Try memorizing the color code and get familiar with the key strokes to enter the values. See the Color Band tutorial for additional help, then try again and see if you can go faster.'
        ]
    };
    
    this.root.time.reading_time.processPatterns = function (key, messages, subs) {
        if (key === 'slow') {
            messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)/m,
                    '$1<font color="red"><i>' + subs[0] + '</i></font>$2');
        }
        return messages;
    };

    this.root.time.measuring_time.feedbackSpace = {
        efficient: [
            'Very efficient!',
            'For this assessment, setting up the digital multimeter and correctly connecting it to the circuit is the key to entering your answer in less than 20 seconds. You did this! Good work!'
        ],
        semi: [
            'Efficient',
            'For this assessment, you should be familiar with the digital multimeter so you know where to set the knob, where to connect the leads, and how to turn on the meter to obtain a reading in less than 20 seconds.  See the Using the DMM tutorial for additional help.'
        ],
        slow: [
            'Too slow',
            'Your goal is to use the digital multimeter quickly and effectively.  You should be familiar with the DMM so that you know where to set the knob, where to connect the leads, and how to turn I on in order to obtain a reading in less than 20 seconds. You took ${your-time} seconds. That’s too long!. See the Using the DMM tutorial for additional help.'
        ]
    };

    this.root.time.measuring_time.processPatterns = function (key, messages, subs) {
        if (key === 'slow') {
            messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)/m,
                    '$1<font color="red"><i>' + subs[0] + '</i></font>$2');
        }
        return messages;
    };
    
}
