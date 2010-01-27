/* The following line (global) is for JSLint */
/*global console*/

function Event(name, value, time) {
    this.name = name;
    this.value = value;
    this.time = time;
}

function Question(id) {
    this.id = id;
    this.correct_answer = '';
    this.answer = '';
    this.unit = '';
    this.correct = false;
    this.start_time = null;
    this.end_time = null;
}

function Section() {
    this.events = [];
    this.questions = [];
    this.start_time = null;
    this.end_time = null;
}

function Session() {
    this.sections = [];
    this.start_time = null;
    this.end_time = null;
}

/* Log object structure
 * - session is the unit of upload to server
 * 
 * ActivityLog:
 *   sessions:
 *     - session
 *         start_time:
 *         end_time:
 *         sections:
 *           - section
 *               start_time:
 *               end_time:
 *               events:
 *                 - event
 *                     name:
 *                     value:
 *                     time:
 *               questions:
 *                 - question
 *                     id:
 *                     correct_answer:
 *                     answer:
 *                     unit:
 *                     correct:
 *                     start_time:
 *                     end_time:
 */
function ActivityLog()
{
    //console.log('ENTER ActivityLog');
    
    this.sessions = [];
    this.numSessions = 0;
}

ActivityLog.prototype =
{
    beginNextSession : function() {
        var session = new Session();
        var section = new Section();
        var questions = section.questions;
        
        questions.push(new Question('rated_resistance'));
        questions.push(new Question('rated_tolerance'));
        questions.push(new Question('measured_resistance'));
        questions.push(new Question('measured_tolerance'));
        questions.push(new Question('within_tolerance'));
        
        session.sections.push(section);
        this.sessions.push(session);
        this.numSessions += 1;
    },
    
    currentSession : function() {
        return this.sessions[this.numSessions - 1];
    },
      
    add : function(name, params) {
        var now = new Date().valueOf();
        var section = this.currentSession().sections[0];
        
        switch (name)
        {
        case 'multimeter_dial':
            console.log('multimeter_dial ' + params.value);
            section.events.push(new Event('multimeter_dial', params.value, now));
            break;
        case 'connect':
            console.log('connect ' + params.conn1 + ' to ' + params.conn2);
            section.events.push(new Event('connect', params.conn1 + '|' + params.conn2, now));
            break;
        case 'disconnect':
            section.events.push(new Event('disconnect', params.value, now));
            break;
        case 'make_circuit':
            section.events.push(new Event('make_circuit', '', now));
            break;
        case 'break_circuit':
            section.events.push(new Event('break_circuit', '', now));
            break;
        case 'start_section':
            section.start_time = now;
            break;
        case 'end_section':
            section.end_time = now;
            break;
        case 'start_question':
            section.questions[params.question-1].start_time = now;
            break;
        case 'end_question':
            section.questions[params.question-1].end_time = now;
            break;
        case 'multimeter_power':
            section.events.push(new Event('multimeter_power', params.value, now));
            break;
        case 'start_session':
            this.currentSession().start_time = now;
            break;
        case 'end_session':
            this.currentSession().end_time = now;
            break;
        default:
            console.log('ERROR: add: Unknown log event name ' + name);
        }
    },
    
    getLastConnection : function(conn1) {
        var events = this.currentSession().sections[0].events;
        var conn2 = null;
        var values = null;
        for (var i = 0; i < events.length; ++i) {
            if (events[i].name == 'connect') {
                values = events[i].value.split('|');
                if (values[0] == conn1) {
                    conn2 = values[1];
                }
            }
        }
        //console.log('conn1=' + conn1 + ' conn2=' + conn2);
        return conn2;
    },
    
    // DMM dial setting when the circuit is last made before 
    // measured resistance is submitted
    getInitialDialSetting: function() {
        var end_time = this.currentSession().sections[0].questions[2].end_time;
        var setting = null;
        var last_make = this.getLastCircuitMakeTime();
        if (last_make === null) {
            return null; // circuit is not connected so dial setting is meaningless
        }
        var events = this.currentSession().sections[0].events;
        for (var i = 0; i < events.length && events[i].time < end_time; ++i) {
            if (events[i].name == 'multimeter_dial' && events[i].time <= last_make) {
                setting = events[i].value;
                break;
            }
        }
        return setting;
    },
    
    getFinalDialSetting: function() {
        var end_time = this.currentSession().sections[0].questions[2].end_time;
        var setting = null;
        var last_break = this.getLastCircuitBreakTime();
        if (last_break > -Infinity) {
            end_time = last_break;
        }
        var events = this.currentSession().sections[0].events;
        for (var i = 0; i < events.length && events[i].time < end_time; ++i) {
            if (events[i].name == 'multimeter_dial') {
                setting = events[i].value;
            }
        }
        return setting;
    },
    
    /*
     * Last time before measured resistance is submitted that the circuit is 
     * all connected.
     * 
     * Returns +Infinity if there's no 'make_circuit' events.
     */
    getLastCircuitMakeTime : function() {
        var end_time = this.currentSession().sections[0].questions[2].end_time;
        var make_time = Infinity;
        var events = this.currentSession().sections[0].events;
        for (var i = 0; i < events.length && events[i].time < end_time; ++i) {
            if (events[i].name === 'make_circuit') {
                make_time = events[i].time;
            }
        }
        return make_time;
    },
    
    getLastCircuitBreakTime : function() {
        var end_time = this.currentSession().sections[0].questions[2].end_time;
        var break_time = -Infinity;
        var events = this.currentSession().sections[0].events;
        for (var i = 0; i < events.length && events[i].time < end_time; ++i) {
            if (events[i].name === 'break_circuit') {
                break_time = events[i].time;
            }
        }
        return break_time;
    }
};
