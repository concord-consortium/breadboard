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
    
    //this.sections = [new Section(), new Section(), new Section()];
    this.sections = [new Section()];
    
    //for (var i = 0; i < 3; ++i) {
    for (var i = 0; i < 1; ++i) {
        var questions = this.sections[i].questions;
        questions.push(new Question('rated_resistance'));
        questions.push(new Question('rated_tolerance'));
        questions.push(new Question('measured_resistance'));
        questions.push(new Question('measured_tolerance'));
        questions.push(new Question('within_tolerance'));
    }
}

ActivityLog.prototype =
{
    add : function(name, params) {
        var now = new Date().valueOf();
        switch (name)
        {
        case 'start_section':
            this.sections[0].start_time = now;
            break;
        case 'end_section':
            this.sections[0].end_time = now;
            break;
        case 'start_activity':
            this.start_time = now; 
            this.sections[0].start_time = now;
            break;
        case 'start_resistor2':
            this.sections[0].end_time = now;
            this.sections[1].start_time = now;
            break;
        case 'start_resistor3':
            this.sections[1].end_time = now;
            this.sections[2].start_time = now;
            break;
        case 'end_activity':
            this.sections[2].end_time = now;
            this.end_time = new Date().valueOf();
            break;
        case 'start_question':
            //this.sections[params.section-1].questions[params.question-1].start_time = now;
            this.sections[0].questions[params.question-1].start_time = now;
            break;
        case 'end_question':
            //this.sections[params.section-1].questions[params.question-1].end_time = now;
            this.sections[0].questions[params.question-1].end_time = now;
            break;
        default:
            console.log('ERROR: add: Unknown log event name ' + name);
        }
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

