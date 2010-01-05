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
    this.questions = [];
    this.events = [];
    this.start_time = null;
    this.end_time = null;
}

/* Log object structure:
 * ActivityLog:
 *   start_time:
 *   end_time:
 *   sections:
 *     - section 1
 *         start_time:
 *         end_time:
 *         events:
 *           - event
 *               name:
 *               value:
 *               time:
 *         questions:
 *           - question N
 *               id:
 *               correct_answer:
 *               answer:
 *               unit:
 *               correct:
 *               start_time:
 *               end_time:
 *     - section 2
 *         [same as section 1]
 *     - section 3
 *         [same as section 1]
 */
function ActivityLog()
{
    //console.log('ENTER ActivityLog');
    this.start_time = null;
    this.end_time = null;
    this.sections = [];
    
    this.sections = [];
    this.numSections = 0;
}

ActivityLog.prototype =
{
    beginNextSection : function() {
        var section = new Section();
        var questions = section.questions;
        
        questions.push(new Question('rated_resistance'));
        questions.push(new Question('rated_tolerance'));
        questions.push(new Question('measured_resistance'));
        questions.push(new Question('measured_tolerance'));
        questions.push(new Question('within_tolerance'));
        
        this.sections.push(section);
        this.numSections += 1;
    },
    
    currentSection : function() {
        return this.sections[this.numSections - 1];
    },
      
    add : function(name, params) {
        var now = new Date().valueOf();
        switch (name)
        {
        case 'connect':
            console.log('connect ' + params.conn1 + ' to ' + params.conn2);
            this.currentSection().events.push(new Event('connect', params.conn1 + '|' + params.conn2, now));
            break;
        case 'start_section':
            this.currentSection().start_time = now;
            break;
        case 'end_section':
            this.currentSection().end_time = now;
            break;
        case 'start_question':
            this.currentSection().questions[params.question-1].start_time = now;
            break;
        case 'end_question':
            this.currentSection().questions[params.question-1].end_time = now;
            break;
        default:
            console.log('ERROR: add: Unknown log event name ' + name);
        }
    },
    
    getLastConnection : function(conn1) {
        var events = this.currentSection().events;
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
    
    formatDate : function(ms) {
        var date = new Date(ms);
        var s = this.fillZero(date.getMonth() + 1) + '/';
        s += this.fillZero(date.getDate()) + '/';
        s += String(date.getFullYear()) + ' ';
        s += this.fillZero(date.getHours()) + ':';
        s += this.fillZero(date.getMinutes()) + ':';
        s += this.fillZero(date.getSeconds()) + ' ';
        return s;
    },
    
    fillZero : function(val) {
        return val < 10 ? '0' + val : String(val);
    }
    
};

